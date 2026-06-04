import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export const fmt        = (d, f = 'DD MMM YYYY')      => d ? dayjs(d).format(f) : '—';
export const fmtTime    = (d)                          => d ? dayjs(d).format('hh:mm A') : '—';
export const fmtDateTime= (d)                          => d ? dayjs(d).format('DD MMM YYYY, hh:mm A') : '—';
export const fromNow    = (d)                          => d ? dayjs(d).fromNow() : '—';
export const monthYear  = (d)                          => d ? dayjs(d).format('MMMM YYYY') : '—';
export const isoMonth   = (d = new Date())             => dayjs(d).startOf('month').format('YYYY-MM-DD');
export const duration   = (min)                        => min ? `${min} min` : '—';
export const currency   = (n, sym = 'LKR')             => `${sym} ${Number(n || 0).toLocaleString()}`;
