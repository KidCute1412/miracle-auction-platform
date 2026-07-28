import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Loading from "@/components/common/Loading";

export default function ListSearchProductPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const query = searchParams.get("query") || searchParams.get("q") || searchParams.get("search") || "";
    const page = searchParams.get("page") || "1";
    const targetParams = new URLSearchParams();
    if (query) targetParams.set("search", query);
    if (page) targetParams.set("page", page);

    navigate(`/products?${targetParams.toString()}`, { replace: true });
  }, [searchParams, navigate]);

  return <Loading />;
}
