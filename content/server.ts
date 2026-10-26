import "server-only";
import { articles, perspective } from "./articles";
import { references } from "./references";
import { readReviewMode, selectArticles, validateArticle, validateClaims, assertUniqueIds } from "./schema";
import { claims } from "./claims";

export const reviewMode = readReviewMode(process.env);
validateClaims(claims);
assertUniqueIds(references);
assertUniqueIds([...articles, perspective].map(article => ({ id: article.slug })));
for (const article of [...articles, perspective]) validateArticle(article, references);
export const visibleArticles = selectArticles(articles, reviewMode);
export const visiblePublications = selectArticles([perspective], reviewMode);
export const contentPaths = ["/", "/approach/", "/research/", "/research/cordyceps-militaris/", "/research/tuber-melanosporum/", "/applications/", "/progress/", "/journal/", "/journal/editorial-policy/", "/people/", "/publications/", "/publications/review-policy/", "/collaborate/", ...visibleArticles.map(article => `/journal/${article.slug}/`), ...visiblePublications.map(article => `/publications/${article.slug}/`)];
