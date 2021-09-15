import NodeCache from 'node-cache';

export const cache: NodeCache = new NodeCache();

export const CacheKeys = {
  ExamsSettings: 'exam-settings',
};
