UPDATE roles
SET permissions = '["*"]'
WHERE id = 'admin';

UPDATE roles
SET permissions = '["dashboard","pos","sales","stock","articles","partners","reports","settings"]'
WHERE id = 'manager';

UPDATE roles
SET permissions = '["dashboard","pos"]'
WHERE id = 'cashier';
