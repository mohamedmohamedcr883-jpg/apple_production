import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE } from '../config/api';
import { getCategoryLabel } from '../config/categories';

const AnnouncementBar = () => {
  const [offers, setOffers] = useState([]);
  const { pathname } = useLocation();

  useEffect(() => {
    const controller = new AbortController();
    let loading = false;
    const loadOffers = async () => {
      if (loading) return;
      loading = true;
      try {
        const response = await fetch(`${API_BASE}/product/active-offers`, {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
        });
        if (!response.ok) throw new Error('Unable to load offers');
        const result = await response.json();
        if (!result.success || !Array.isArray(result.data)) throw new Error('Invalid offers response');
        if (!controller.signal.aborted) {
          const now = Date.now();
          setOffers(result.data.filter(offer => new Date(offer.startDate).getTime() <= now && new Date(offer.expiryDate).getTime() > now));
        }
      } catch {
        if (!controller.signal.aborted) setOffers([]);
      } finally {
        loading = false;
      }
    };
    loadOffers();
    const interval = window.setInterval(loadOffers, 60000);
    window.addEventListener('focus', loadOffers);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener('focus', loadOffers);
    };
  }, [pathname]);

  useEffect(() => {
    if (!offers.length) return;
    const expiry = Math.min(...offers.map(offer => new Date(offer.expiryDate).getTime()));
    const timeout = window.setTimeout(() => {
      setOffers(current => current.filter(offer => new Date(offer.expiryDate).getTime() > Date.now()));
    }, Math.min(Math.max(0, expiry - Date.now()), 2147483647));
    return () => window.clearTimeout(timeout);
  }, [offers]);

  if (!offers.length) return null;

  return (
    <aside className="promotion-bar" aria-label="Current offers">
      <ul className="container list-unstyled mb-0 d-flex flex-wrap justify-content-center gap-1 gap-md-3">
        {offers.map(offer => (
          <li key={offer._id}>
            <Link className="promotion-link" to={`/pages/category.html?cat=${encodeURIComponent(offer.category)}`}>
              <strong className="promotion-title">{offer.title}</strong>
              {offer.discountType === 'percentage' && <span className="promotion-discount">Up to {Math.min(100, offer.discountValue)}% OFF</span>}
              <span className="promotion-cta">Shop {getCategoryLabel(offer.category)} <span aria-hidden="true">→</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default AnnouncementBar;
