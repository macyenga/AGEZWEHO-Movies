import { TOP_QUERIES, RISING_QUERIES, NEWS_QUERIES } from '../../lib/trending';

export default function handler(_, res) {
  return res.status(200).json({
    top: TOP_QUERIES,
    rising: RISING_QUERIES,
    news: NEWS_QUERIES,
  });
}