import http from 'k6/http';
import { check, sleep } from 'k6';

// Define stress testing execution options
export const options = {
  stages: [
    { duration: '5s', target: 50 },  // Ramp up to 50 concurrent virtual users
    { duration: '15s', target: 100 }, // Sustain 100 concurrent virtual users
    { duration: '5s', target: 0 },   // Ramp down load to 0 virtual users
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // Limit failed requests under 5%
    http_req_duration: ['p(95)<1000'], // 95% of requests must respond in under 1 second
  },
};

// Open and load generated offline token list
const tokensData = JSON.parse(open('./tokens.json'));

const TARGET_PRODUCT_ID = 1;     // Target auction product id in test database
const START_PRICE = 100000;      // Base bidding price of test product
const STEP_PRICE = 10000;        // Minimum bidding increment price

export default function () {
  // Select a random user token for authentication
  const userIndex = Math.floor(Math.random() * tokensData.length);
  const user = tokensData[userIndex];

  // Calculate unique incremented bid price to bypass validations
  const myBidPrice = START_PRICE + (__VU * STEP_PRICE) + (__ITER * STEP_PRICE * 2);

  const url = 'http://localhost:5000/api/bid/play';
  const payload = JSON.stringify({
    product_id: TARGET_PRODUCT_ID,
    max_price: myBidPrice,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `accessToken=${user.token}`,
    },
  };

  // Perform concurrent bid request
  const res = http.post(url, payload, params);

  // Validate response status codes
  check(res, {
    'status is valid business response 200 or 400': (r) => r.status === 200 || r.status === 400,
    'status is not 500 server error': (r) => r.status !== 500,
  });

  // Short delay between bids
  sleep(0.05);
}
