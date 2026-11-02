import React, { useEffect, useState } from 'react';
import API from '../Services/api';

export default function ProductCatalog({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/products')
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '1rem' }}>Loading inventory...</div>;

  return (
    <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      {products.map((product) => (
        <div key={product.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h3>{product.name}</h3>
          <p>Price: ${product.price}</p>
          <p>Stock: {product.stockQuantity > 0 ? product.stockQuantity : 'Out of Stock'}</p>
          <button
            disabled={product.stockQuantity <= 0}
            onClick={() => addToCart(product)}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}