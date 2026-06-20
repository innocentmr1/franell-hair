import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc',label: 'Price: High to Low' },
  { value: 'rating',    label: 'Top Rated' },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cats, setCats] = useState([]);

  useEffect(() => {
    getCategories().then(({ data }) => setCats(data)).catch(() => {});
  }, []);

  const category = searchParams.get('category') || '';
  const hairType  = '';
  const search    = searchParams.get('search')    || '';
  const sort      = searchParams.get('sort')      || 'newest';
  const page      = Number(searchParams.get('page')) || 1;
  const minPrice  = searchParams.get('minPrice')  || '';
  const maxPrice  = searchParams.get('maxPrice')  || '';

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getProducts({ category, hairType, search, sort, page, minPrice, maxPrice, limit: 12 });
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, hairType, search, sort, page, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const Filters = () => (
    <div>
      <div className="filter-section">
        <h3 className="filter-section-title">Category</h3>
        <div className="filter-options">
          <button onClick={() => setParam('category', '')}
            className={`filter-btn ${!category ? 'active' : ''}`}>
            All Products ({total})
          </button>
          {cats.map((cat) => (
            <button key={cat._id || cat.name} onClick={() => setParam('category', cat.name)}
              className={`filter-btn ${category === cat.name ? 'active' : ''}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-section-title">Price Range</h3>
        <div className="filter-price-row">
          <input type="number" placeholder="Min" value={minPrice}
            onChange={(e) => setParam('minPrice', e.target.value)}
            className="filter-price-input" />
          <input type="number" placeholder="Max" value={maxPrice}
            onChange={(e) => setParam('maxPrice', e.target.value)}
            className="filter-price-input" />
        </div>
      </div>

      {(category || minPrice || maxPrice || search) && (
        <button onClick={() => setSearchParams({})} className="filter-clear">
          <X size={12} /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div>
          <h1 className="shop-title">
            {search ? `Results for "${search}"` : category || 'All Products'}
          </h1>
          <p className="shop-count">{total} products</p>
        </div>
        <div className="shop-header-right">
          <button onClick={() => setSidebarOpen(true)} className="shop-filter-btn">
            <SlidersHorizontal size={14} /> Filters
          </button>
          <select value={sort} onChange={(e) => setParam('sort', e.target.value)} className="shop-sort-select">
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="shop-layout">
        <aside className="shop-sidebar"><Filters /></aside>

        {sidebarOpen && (
          <div className="mobile-overlay">
            <div className="mobile-overlay-bg" onClick={() => setSidebarOpen(false)} />
            <div className="mobile-sidebar-drawer">
              <div className="mobile-sidebar-header">
                <h2 className="mobile-sidebar-title">Filters</h2>
                <button className="mobile-sidebar-close" onClick={() => setSidebarOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <Filters />
            </div>
          </div>
        )}

        <div className="shop-products">
          {loading ? (
            <div className="products-grid-shop">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="shop-skeleton">
                  <div className="shop-skeleton-img" />
                  <div className="shop-skeleton-body">
                    <div className="shop-skeleton-line shop-skeleton-half" />
                    <div className="shop-skeleton-line" />
                    <div className="shop-skeleton-line shop-skeleton-third" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="shop-empty">
              <p className="shop-empty-title">No products found</p>
              <p className="shop-empty-sub">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="products-grid-shop">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              {pages > 1 && (
                <div className="pagination">
                  {[...Array(pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const p = new URLSearchParams(searchParams);
                        p.set('page', i + 1);
                        setSearchParams(p);
                      }}
                      className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
