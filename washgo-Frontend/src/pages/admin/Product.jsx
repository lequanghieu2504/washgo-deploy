import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTimes,
  FaEdit,
  FaTrash,
  FaClock,
  FaMoneyBill,
  FaChevronDown,
} from "react-icons/fa";
import { Button, Input } from "@/components/ui";

export default function ProductPage() {
  const [productMasters, setProductMasters] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [subProducts, setSubProducts] = useState([]);
  const [showSubForm, setShowSubForm] = useState(false);
  const [subFormProduct, setSubFormProduct] = useState(null);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [subByProduct, setSubByProduct] = useState({});

  // State cho form sub product
  const [subName, setSubName] = useState("");
  const [subDescription, setSubDescription] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [timing, setTiming] = useState("");
  const [parentId, setParentId] = useState("");
  const [active, setActive] = useState(true);

  const [showProductForm, setShowProductForm] = useState(false);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productEffectiveFrom, setProductEffectiveFrom] = useState("");
  const [productEffectiveTo, setProductEffectiveTo] = useState("");
  const [productTiming, setProductTiming] = useState("");
  const [productActive, setProductActive] = useState(true);
  const [productMasterid, setProductMasterid] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCurrency, setProductCurrency] = useState("");

  const [products, setProducts] = useState([]);

  const accessToken = localStorage.getItem("accessToken") || "";

  const carwashId = JSON.parse(atob(accessToken.split(".")[1])).userId;

  const fetchProducts = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/products/carwash/${carwashId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      console.log("Fetched products:", data);
      setProducts(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách Product:", err);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Lấy danh sách product master
  useEffect(() => {
    async function fetchProductMasters() {
      try {
        const res = await fetch(
          "http://localhost:8080/api/product-master/getAll",
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch product masters");
        const data = await res.json();
        setProductMasters(data);
      } catch {
        setProductMasters([]);
      }
    }
    fetchProductMasters();
  }, []);

  // Lấy danh sách sub product khi chọn master
  const handleSelectMaster = async (master) => {
    setSelectedMaster(master);
    setShowSubForm(false);
    try {
      console.log("Fetching sub products for masterId =", master.id);
      const res = await fetch(
        `http://localhost:8080/api/products/carwash/subproduct/${master.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response status:", res.status);

      if (!res.ok) throw new Error("Failed to fetch sub products");
      const data = await res.json();
      setSubProducts(Array.isArray(data) ? data : data ? [data] : []);
    } catch {
      setSubProducts([]);
    }
  };

  const handleCreateProduct = async () => {
    if (!productMasterid || !productTiming) {
      alert("Vui lòng nhập đầy đủ Product Master ID và Timing (hh:mm:ss)");
      return;
    }

    const payload = {
      name: productName,
      description: productDescription,
      effectiveFrom: productEffectiveFrom,
      effectiveTo: productEffectiveTo,
      active: productActive,
      timing: productTiming,
      productMasterId: Number(productMasterid),
      price: productPrice ? Number(productPrice) : null,
      currency: productCurrency,
    };

    try {
      const res = await fetch("http://localhost:8080/api/products/master", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          // Thêm Authorization nếu backend yêu cầu
          // "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Tạo Product thành công!");
      setShowProductForm(false);
      setProductName("");
      setProductDescription("");
      setProductEffectiveFrom("");
      setProductEffectiveTo("");
      setProductTiming("");
      setProductActive(true);
      setProductMasterid("");
      setProductPrice("");
      setProductCurrency("");
      await fetchProducts();
    } catch (err) {
      alert("Tạo thất bại: " + err.message);
    }
  };

  // Tạo Sub Product
  const handleCreateSubProduct = async () => {
    if (!selectedMaster || !selectedMaster.id) {
      // Allow creating from product context as well
      if (!subFormProduct) {
        alert("Chọn Product Master hoặc Product trước!");
        return;
      }
    }
    if (!subName?.trim()) {
      alert("Vui lòng nhập tên Sub Product");
      return;
    }
    if (!timing?.trim()) {
      alert("Vui lòng nhập Timing (hh:mm:ss)");
      return;
    }
    console.log("selectedMaster", selectedMaster);

    const payload = {
      name: subName,
      description: subDescription,
      effectiveFrom,
      effectiveTo,
      timing,
      active,
      parentId: subFormProduct?.id || (parentId ? Number(parentId) : null),
      productMasterId: selectedMaster?.id || subFormProduct?.productMasterId,
    };
    console.log("payload", payload);
    console.log("name", products);

    try {
      const res = await fetch(
        "http://localhost:8080/api/products/create/subProduct",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      alert("Tạo Sub Product thành công!");
      setShowSubForm(false);
      setSubFormProduct(null);
      setSubName("");
      setSubDescription("");
      setEffectiveFrom("");
      setEffectiveTo("");
      setTiming("");
      setParentId("");
      setActive(true);
      // Reload sub products list for the product if present, otherwise by master
      if (subFormProduct?.id) {
        await fetchSubProductsForProduct(subFormProduct.id);
      } else if (selectedMaster) {
        handleSelectMaster(selectedMaster);
      }
    } catch (err) {
      alert("Tạo thất bại: " + err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error(await res.text());
      alert("Deleted successfully");
      await fetchProducts();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleEditProduct = (product) => {
    alert(`Edit product: ${product.name}`);
  };

  const handleEditSubProduct = (sp) => {
    alert(`Edit sub product: ${sp.name}`);
  };

  const handleDeleteSubProduct = async (spId) => {
    const confirmed = window.confirm("Delete this sub product?");
    if (!confirmed) return;
    try {
      const res = await fetch(`http://localhost:8080/api/products/${spId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Deleted successfully");
      // Remove from any product sub list cache
      setSubByProduct((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = Array.isArray(next[key])
            ? next[key].filter((sp) => sp.id !== spId)
            : next[key];
        }
        return next;
      });
      if (selectedMaster) await handleSelectMaster(selectedMaster);
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // Fetch sub-products for a specific product id
  const fetchSubProductsForProduct = async (productId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/products/subproducts/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch sub products for product");
      const data = await res.json();
      setSubByProduct((prev) => ({
        ...prev,
        [productId]: Array.isArray(data) ? data : data ? [data] : [],
      }));
    } catch (err) {
      console.error("Fetch sub-products by product failed:", err);
      setSubByProduct((prev) => ({ ...prev, [productId]: [] }));
    }
  };

  const toggleProductExpand = async (product) => {
    // Nếu click vào card đang mở, đóng nó lại
    if (expandedProductId === product.id) {
      setExpandedProductId(null);
      return;
    }

    // Nếu click vào card mới, mở nó và load data nếu chưa có
    setExpandedProductId(product.id);
    if (!subByProduct[product.id]) {
      await fetchSubProductsForProduct(product.id);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Products
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage product masters and sub products
          </p>
        </div>
      </div>

      {/* Danh sách Product Master */}
      <h2 className="text-xl font-bold mb-4">Product Master List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {productMasters.map((master) => (
          <div
            key={master.id}
            className={`bg-white rounded-xl p-4 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer ${
              selectedMaster?.id === master.id
                ? "ring-2 ring-blue-500 border-blue-200"
                : "hover:border-blue-300"
            }`}
            onClick={() => handleSelectMaster(master)}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-gray-900">{master.name}</span>
              <div className="flex gap-2">
                <button
                  className="p-1.5 rounded-full bg-green-50 hover:bg-green-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProductMasterid(String(master.id));
                    setSelectedMaster(master);
                    setShowProductForm(true);
                  }}
                  title="Create Product"
                >
                  <FaPlus className="text-green-600 text-sm" />
                </button>
                <button
                  className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100"
                  onClick={() => handleEditSubProduct(master)}
                  title="Edit"
                >
                  <FaEdit className="text-blue-600 text-sm" />
                </button>
                <button
                  className="p-1.5 rounded-full bg-red-50 hover:bg-red-100"
                  onClick={() => handleDeleteSubProduct(master.id)}
                  title="Delete"
                >
                  <FaTrash className="text-red-600 text-sm" />
                </button>
              </div>
            </div>
            <div className="text-gray-600 text-sm mt-1 line-clamp-2 mb-5">
              {master.description}
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1">
                Duration: {master.duration}
              </span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-10 mb-4">Products List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.length === 0 ? (
          <div className="text-gray-500 italic">No products found.</div>
        ) : (
          products.map((product, index) => (
            <div
              key={
                product?.id ||
                product?.productMasterId ||
                product?.name ||
                `${product?.productMasterName || "product"}-${
                  product?.timing || "time"
                }-${index}`
              }
              className="rounded-2xl bg-white p-4 min-h-[200px] shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg text-black">
                  {product.productName || "Name"}
                </h3>
                <div className="flex gap-2 items-center">
                  <button
                    className="p-2 rounded-full bg-green-50 hover:bg-green-100"
                    onClick={() => {
                      setSelectedMaster({
                        id: product.productMasterId,
                        name: product.productMasterName,
                      });
                      setSubFormProduct(product);
                      setShowSubForm(true);
                    }}
                    title="Create Sub Product"
                  >
                    <FaPlus className="text-green-600 cursor-pointer" />
                  </button>
                  
                  <button
                    className="p-2 rounded-full bg-blue-50 hover:bg-blue-100"
                    onClick={() => handleEditProduct(product)}
                    title="Edit"
                  >
                    <FaEdit className="text-blue-600 cursor-pointer" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-red-50 hover:bg-red-100"
                    onClick={() => handleDeleteProduct(product.id)}
                    title="Delete"
                  >
                    <FaTrash className="text-red-600 cursor-pointer" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <p className="text-sm text-gray-600 line-clamp-3 mb-20">
                {product.description || "No description"}
              </p>

              {/* Footer */}
              <div className="mt-auto flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 gap-1">
                  <FaClock /> {product.timing}
                </span>
                <span
                  className={`inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-1 ${
                    product.active
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {product.active ? "Active" : "Inactive"}
                </span>
                {product.price && (
                  <span className="inline-flex items-center rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium px-2.5 py-1 gap-1">
                    <FaMoneyBill /> {product.price} {product.currency}
                  </span>
                  
                )}
                <button
                    className={`transition-transform ${
                      expandedProductId === product.id ? "rotate-180" : "rotate-0"
                    } ml-auto`}
                    onClick={() => toggleProductExpand(product)}
                    title="Toggle Sub Products"
                  >
                    <FaChevronDown className="text-black w-3 h-3" />
                </button>
              </div>

              {/* Expandable sub-products under product */}
              <div className="mt-3">
                {expandedProductId === product.id && (
                  <div className="mt-2">
                    {Array.isArray(subByProduct[product.id]) &&
                    subByProduct[product.id].length > 0 ? (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {subByProduct[product.id].map((sp) => (
                          <li
                            key={sp.id}
                            className="bg-white border rounded-xl shadow-sm p-3 flex flex-col"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-gray-900">
                                {sp.name}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100"
                                  onClick={() => handleEditSubProduct(sp)}
                                  title="Edit"
                                >
                                  <FaEdit className="text-blue-600 text-sm" />
                                </button>
                                <button
                                  className="p-1.5 rounded-full bg-red-50 hover:bg-red-100"
                                  onClick={() => handleDeleteSubProduct(sp.id)}
                                  title="Delete"
                                >
                                  <FaTrash className="text-red-600 text-sm" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {sp.description || "No description"}
                            </p>
                            <div className="flex flex-wrap gap-2 text-[11px]">
                              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                <FaClock /> {sp.timing}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full ${
                                  sp.active
                                    ? "bg-green-50 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {sp.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-400 italic">
                        No sub products.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form tạo Sub Product */}
      {showSubForm && (
        <div className="fixed inset-0 bg-black/40 opacity-100 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg sm:text-xl font-bold">
                Create Sub Product{" "}
                {selectedMaster ? `for "${selectedMaster.productName}"` : ""}
              </h2>
              <Button variant="ghost" onClick={() => setShowSubForm(false)}>
                <FaTimes />
              </Button>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    Name
                  </label>
                  <Input
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    Description
                  </label>
                  <Input
                    value={subDescription}
                    onChange={(e) => setSubDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Effective From
                  </label>
                  <Input
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Effective To
                  </label>
                  <Input
                    type="date"
                    value={effectiveTo}
                    onChange={(e) => setEffectiveTo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Timing (hh:mm:ss)
                  </label>
                  <Input
                    type="text"
                    placeholder="00:30:00"
                    value={timing}
                    onChange={(e) => setTiming(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Parent ID (optional)
                  </label>
                  <Input
                    type="number"
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    id="active"
                  />
                  <label htmlFor="active" className="text-sm font-semibold">
                    Active
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                <Button variant="outline" onClick={() => setShowSubForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSubProduct}>Submit</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form tạo Product */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/45 bg-opacity-100 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg sm:text-xl font-bold">Create Product</h2>
              <Button variant="ghost" onClick={() => setShowProductForm(false)}>
                <FaTimes />
              </Button>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    Name
                  </label>
                  <Input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    Description
                  </label>
                  <Input
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Effective From
                  </label>
                  <Input
                    type="date"
                    value={productEffectiveFrom}
                    onChange={(e) => setProductEffectiveFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Effective To
                  </label>
                  <Input
                    type="date"
                    value={productEffectiveTo}
                    onChange={(e) => setProductEffectiveTo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Timing (hh:mm:ss)
                  </label>
                  <Input
                    type="text"
                    placeholder="01:00:00"
                    value={productTiming}
                    onChange={(e) => setProductTiming(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Product Master ID
                  </label>
                  <Input
                    type="number"
                    value={productMasterid}
                    onChange={(e) => setProductMasterid(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Price
                  </label>
                  <Input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Currency
                  </label>
                  <Input
                    type="text"
                    placeholder="VND"
                    value={productCurrency}
                    onChange={(e) => setProductCurrency(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    checked={productActive}
                    onChange={(e) => setProductActive(e.target.checked)}
                    id="productActive"
                  />
                  <label
                    htmlFor="productActive"
                    className="text-sm font-semibold"
                  >
                    Active
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowProductForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateProduct}>Submit</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
