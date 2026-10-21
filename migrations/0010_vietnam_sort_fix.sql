-- 0010_vietnam_sort_fix.sql
-- 修复越南产品排序冲突：将 0007/0008 旧产品 sort 调到 100+，让 0009 热卖款(sort 1-50)优先展示
-- 0007 产品 model 前缀: VN-CD-, VN-KT-, VN-PL-, VN-LW-
-- 0008 产品 model 前缀: VN-B2-
-- 0009 产品 model 前缀: VN-HOT-

-- 将 0007/0008 产品的 sort 值统一加 100，确保 0009 产品(sort 1-50)排在最前
update content_products
set sort = sort + 100
where slug like 'vn-%'
  and model not like 'VN-HOT-%'
  and sort < 100;
