import os
import json
import random
import requests
import psycopg2
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# Tiki endpoints
TIKI_CATEGORY_URL = "https://tiki.vn/api/personalish/v1/blocks/listings"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# Subcategory list with matching Tiki API IDs and expected serial IDs
SUBCATEGORIES_DATA = [
    # Điện Tử (Parent 1)
    {"id": 10, "name": "Điện Thoại", "tiki_id": 1795},
    {"id": 11, "name": "Laptop", "tiki_id": 8095},
    {"id": 12, "name": "Máy Tính Bảng", "tiki_id": 1794},
    {"id": 13, "name": "Phụ Kiện Điện Tử", "tiki_id": 1815},
    {"id": 14, "name": "Thiết Bị Âm Thanh", "tiki_id": 1801},
    # Thời Trang (Parent 2)
    {"id": 15, "name": "Áo Nam", "tiki_id": 925},
    {"id": 16, "name": "Áo Nữ", "tiki_id": 5404},
    {"id": 17, "name": "Quần Jeans", "tiki_id": 925},
    {"id": 18, "name": "Giày Dép", "tiki_id": 27572},
    {"id": 19, "name": "Phụ Kiện Thời Trang", "tiki_id": 8374},
    # Nội Thất & Gia Dụng (Parent 7)
    {"id": 20, "name": "Bàn Ghế", "tiki_id": 8374},
    {"id": 21, "name": "Sofa", "tiki_id": 8374},
    {"id": 22, "name": "Đồ Dùng Nhà Bếp", "tiki_id": 1815},
    {"id": 23, "name": "Đèn Trang Trí", "tiki_id": 8374},
    {"id": 24, "name": "Chăn Ga Gối", "tiki_id": 5404},
    # Thể Thao & Du Lịch (Parent 8)
    {"id": 25, "name": "Dụng Cụ Tập Gym", "tiki_id": 27572},
    {"id": 26, "name": "Xe Đạp", "tiki_id": 1801},
    {"id": 27, "name": "Giày Thể Thao", "tiki_id": 27572},
    {"id": 28, "name": "Phụ Kiện Du Lịch", "tiki_id": 925},
    {"id": 29, "name": "Dụng Cụ Camping", "tiki_id": 1815},
    # Sách & Văn Phòng Phẩm (Parent 9)
    {"id": 30, "name": "Sách Văn Học", "tiki_id": 27224},
    {"id": 31, "name": "Sách Kỹ Năng", "tiki_id": 27224},
    {"id": 32, "name": "Văn Phòng Phẩm", "tiki_id": 1815},
    {"id": 33, "name": "Dụng Cụ Học Tập", "tiki_id": 1815},
    {"id": 34, "name": "Sổ Tay", "tiki_id": 27224}
]

def get_db_connection():
    # Attempt connecting to Supabase first, otherwise fallback to local Docker DB config
    conn_str = os.getenv("SUPABASE_CONNECTION_STRING")
    if conn_str:
        return psycopg2.connect(conn_str)
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "my_local_password"),
        database=os.getenv("DB_NAME", "online_auction_test")
    )

def generate_start_time():
    # Generate random start_time from 3 days before to 3 days after today
    now = datetime.now()
    days_offset = random.randint(-3, 3)
    hours_offset = random.randint(0, 23)
    return now + timedelta(days=days_offset, hours=hours_offset)

def generate_end_time(start_time):
    # Generate end_time that is 1-20 days after start_time
    days_to_add = random.randint(1, 20)
    return start_time + timedelta(days=days_to_add)

def generate_prices(base_price):
    # Generate realistic auction prices based on the product base price
    if not base_price or base_price <= 0:
        base_price = random.randint(50, 500) * 10000
    start_price = int(base_price * random.uniform(0.6, 0.9))
    step_price = int(start_price * 0.05)
    buy_now_price = int(start_price * 1.5)
    return {
        'start_price': start_price,
        'current_price': start_price,
        'step_price': step_price,
        'buy_now_price': buy_now_price
    }

def main():
    print("Connecting to database...")
    db_categories = []
    seller_ids = [1]
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Query all subcategories from the database
        cursor.execute("SELECT id, name FROM categories WHERE parent_id IS NOT NULL")
        db_categories = cursor.fetchall()
        
        # Query all user IDs to distribute as sellers
        cursor.execute("SELECT user_id FROM users")
        seller_ids = [row[0] for row in cursor.fetchall()]
        if not seller_ids:
            seller_ids = [1]
            
        cursor.close()
        conn.close()
        print("Connected to database successfully. Using dynamic category IDs.")
    except Exception as e:
        print(f"Could not connect to database: {e}. Falling back to offline expected category list.")
        # Fall back to expected hardcoded sequential IDs
        db_categories = [(item["id"], item["name"]) for item in SUBCATEGORIES_DATA]
        
    products_data = []
    
    # Create mapping of subcategory name -> Tiki API category ID
    name_to_tiki = {item["name"]: item["tiki_id"] for item in SUBCATEGORIES_DATA}
    
    print(f"Bắt đầu cào dữ liệu cho {len(db_categories)} danh mục con...")
    
    for cat_id, cat_name in db_categories:
        tiki_cat_id = name_to_tiki.get(cat_name, 1815)
        # Randomly choose target size between 20 and 50 products per category
        target_count = random.randint(20, 50)
        
        print(f"Fetching {target_count} products for DB category: '{cat_name}' (ID: {cat_id}) using Tiki Category ID: {tiki_cat_id}")
        
        try:
            # Query Tiki Listings API
            response = requests.get(
                TIKI_CATEGORY_URL,
                headers=headers,
                params={'limit': target_count, 'category': tiki_cat_id, 'page': 1}
            )
            
            if response.status_code == 200:
                data = response.json()
                tiki_products = data.get('data', [])
                print(f"-> Retreived {len(tiki_products)} products from Tiki.")
                
                for product in tiki_products:
                    name = product.get('name', '')
                    thumbnail_url = product.get('thumbnail_url', '')
                    price = product.get('price', 0)
                    
                    # Clean product name and handle quotes
                    name_escaped = name.replace("'", "''")
                    desc = f"Sản phẩm {name} chất lượng cao. Hàng chính hãng, uy tín và đảm bảo chất lượng.".replace("'", "''")
                    
                    # Prepare images array
                    images = [thumbnail_url, thumbnail_url, thumbnail_url]
                    images_array = "ARRAY[" + ", ".join([f"'{img}'" for img in images]) + "]"
                    
                    prices = generate_prices(price)
                    start_time = generate_start_time()
                    end_time = generate_end_time(start_time)
                    seller_id = random.choice(seller_ids)
                    auto_ext = str(random.choice([True, False])).lower()
                    
                    sql = f"""INSERT INTO products (product_name, seller_id, step_price, start_price, current_price, buy_now_price, start_time, end_time, cat2_id, description, product_images, auto_extended)
VALUES ('{name_escaped}', {seller_id}, {prices['step_price']}, {prices['start_price']}, {prices['current_price']}, {prices['buy_now_price']}, '{start_time.isoformat()}', '{end_time.isoformat()}', {cat_id}, '{desc}', {images_array}, {auto_ext});"""
                    
                    products_data.append(sql)
            else:
                print(f"-> Failed to fetch from Tiki: {response.status_code}")
        except Exception as e:
            print(f"-> Error processing category {cat_name}: {e}")
            
    # Write SQL statements to insert file
    output_path = os.path.join(os.path.dirname(__file__), "product", "tikiAPI", "product.insert.sql")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(products_data))
        
    print(f"\nSuccessfully generated SQL file at: {output_path}")
    print(f"Total product insert statements generated: {len(products_data)}")

if __name__ == "__main__":
    main()
