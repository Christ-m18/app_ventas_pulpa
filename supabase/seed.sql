-- Seed Categories
INSERT INTO categories (name, slug) VALUES
('Frutas Tropicales', 'frutas-tropicales'),
('Frutas del Bosque', 'frutas-del-bosque'),
('Cítricos y Zumos', 'citricos'),
('Combos', 'combos');

-- Seed Products
-- Cada `image_url` apunta a un archivo REAL existente en /public/images/
-- (jpg para foto, mp4 para video). El cliente detecta el tipo por extensión.
DO $$
DECLARE
    tropical_id UUID;
    bosque_id UUID;
    citrico_id UUID;
    combo_id UUID;
BEGIN
    SELECT id INTO tropical_id FROM categories WHERE slug = 'frutas-tropicales';
    SELECT id INTO bosque_id   FROM categories WHERE slug = 'frutas-del-bosque';
    SELECT id INTO citrico_id  FROM categories WHERE slug = 'citricos';
    SELECT id INTO combo_id    FROM categories WHERE slug = 'combos';

    INSERT INTO products
        (name, description, price, stock, unit, image_url, category_id, benefits, is_featured, is_combo)
    VALUES
    ('Pulpa de Tamarindo',
     'Tamarindo dominicano fresco, despulpado a mano. Ideal para refrescos, postres y salsas.',
     200.00, 35, 'lb',
     '/images/Pulpa de tamarindo.mp4',
     tropical_id,
     ARRAY['Rico en hierro', 'Digestivo natural', 'Antioxidante'],
     true, false),

    ('Pulpa de Mango',
     'Mango dominicano variedad Banilejo, congelado al punto óptimo.',
     180.00, 45, 'lb',
     '/images/Pulpa de mango.mp4',
     tropical_id,
     ARRAY['Rico en vitamina A', 'Energizante', 'Digestivo'],
     true, false),

    ('Pulpa de Chinola',
     'Chinola (maracuyá) fresca y colada. Sabor intenso, listo para batir.',
     180.00, 40, 'lb',
     '/images/Pulpa de chinola.mp4',
     tropical_id,
     ARRAY['Vitamina C', 'Antioxidante', 'Relajante'],
     true, false),

    ('Pulpa de Guanábana',
     'Guanábana cremosa y completamente natural, perfecta para batidas.',
     220.00, 30, 'lb',
     '/images/Pulpa de guanábana.mp4',
     tropical_id,
     ARRAY['Fortalece el sistema inmune', 'Antiinflamatorio'],
     false, false),

    ('Fresas Congeladas 5 lb',
     'Fresas seleccionadas, lavadas y congeladas. Paquete familiar de 5 libras.',
     650.00, 25, 'paquete',
     '/images/Fresas congeladas.jpg',
     bosque_id,
     ARRAY['Vitamina C', 'Bajo en calorías', 'Listas para batir'],
     true, false),

    ('Pulpa de Fresa',
     'Pulpa de fresa lista para tu jugo o postre, sin azúcar añadida.',
     250.00, 30, 'lb',
     '/images/Pulpa de Fresa.mp4',
     bosque_id,
     ARRAY['Vitamina C', 'Antioxidante'],
     true, false),

    ('Pulpa de Cereza',
     'Cerezas frescas de finca, ideales para jugos vitamínicos.',
     280.00, 30, 'lb',
     '/images/Pulpa de cereza.mp4',
     bosque_id,
     ARRAY['Vitaminas K, A y C', 'Aporta hierro', 'Calcio y fósforo'],
     false, false),

    ('Zumo de Naranja de Jugo (galón)',
     'Jugo de naranja recién exprimido, sin agua añadida, sin azúcar. Galón listo para servir.',
     400.00, 40, 'paquete',
     '/images/Zumo de naranja de jugo.mp4',
     citrico_id,
     ARRAY['100% natural', 'Vitamina C', 'Sin conservantes'],
     true, false),

    ('Zumo de Naranja Agria (galón)',
     'Naranja agria pura para sazonar carnes, marinados y recetas dominicanas.',
     320.00, 35, 'paquete',
     '/images/Zumo de naranja agria.mp4',
     citrico_id,
     ARRAY['Sazonador natural', 'Rico en vitamina C', 'Sin aditivos'],
     false, false),

    ('Zumo de Mandarina',
     'Mandarina exprimida — refrescante y dulce, lista para servir.',
     280.00, 35, 'paquete',
     '/images/Zumo de mandarina.mp4',
     citrico_id,
     ARRAY['Vitamina C', 'Hidratante', 'Antioxidante'],
     false, false),

    ('Zumo de Limón',
     'Zumo de limón concentrado, ideal para limonadas y aderezos.',
     220.00, 40, 'paquete',
     '/images/Zumo de limón.mp4',
     citrico_id,
     ARRAY['Vitamina C', 'Desintoxicante'],
     true, false);
END $$;
