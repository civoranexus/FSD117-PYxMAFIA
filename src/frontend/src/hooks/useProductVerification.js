import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient, { getApiErrorMessage } from '../api/axios';
import toast from 'react-hot-toast';

/**
 * Custom hook to handle product verification logic.
 * Manages URL/State QR parameters and fetching product details.
 */
export function useProductVerification() {
    const location = useLocation();
    const [fetchedResult, setFetchedResult] = useState(null);
    const [fetchingResult, setFetchingResult] = useState(false);
    const [fetchError, setFetchError] = useState('');

    // 1. Resolve QR Code from State or URL
    const qrFromState = useMemo(() => {
        const qr = location?.state?.qr;
        return typeof qr === 'string' ? qr : '';
    }, [location?.state?.qr]);

    const qrFromQuery = useMemo(() => {
        const sp = new URLSearchParams(location?.search || '');
        const qr = sp.get('qr') || sp.get('code') || '';
        return typeof qr === 'string' ? qr : '';
    }, [location?.search]);

    const qr = qrFromState || qrFromQuery;
    const qrNormalized = useMemo(() => (typeof qr === 'string' ? qr.trim() : ''), [qr]);

    // 2. Resolve Product Data (Prioritize passed state, fallback to fetched)
    const rawResult = useMemo(() => {
        return location?.state?.productResult ?? fetchedResult;
    }, [location?.state?.productResult, fetchedResult]);

    // 3. Fetch Data if needed
    useEffect(() => {
        if (!qrNormalized) return;
        if (location?.state?.productResult) return; // Already have data
        if (fetchedResult) return; // Already fetched

        let cancelled = false;
        const t = setTimeout(() => {
            if (cancelled) return;
            setFetchError('');
            setFetchingResult(true);

            apiClient
                .get(`/products/${encodeURIComponent(qrNormalized)}`)
                .then((res) => {
                    if (cancelled) return;
                    setFetchedResult(res?.data);
                })
                .catch((err) => {
                    if (cancelled) return;
                    const message = getApiErrorMessage(err, 'Unable to load product details. Please rescan the QR.');
                    setFetchError(message);
                    toast.error(message);
                })
                .finally(() => {
                    if (cancelled) return;
                    setFetchingResult(false);
                });
        }, 0);

        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [qrNormalized, location?.state?.productResult, fetchedResult]);

    return {
        qrNormalized,
        rawResult,
        fetchingResult,
        fetchError,
    };
}
