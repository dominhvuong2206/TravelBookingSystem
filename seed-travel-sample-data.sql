SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE payment_transaction;
TRUNCATE TABLE review;
TRUNCATE TABLE booking;
TRUNCATE TABLE travel_service;
TRUNCATE TABLE service_category;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO service_category (id, name, slug, description, active) VALUES
(1, 'Tour du lịch', 'tour', 'Tour du lịch trong nước và quốc tế', b'1'),
(2, 'Khách sạn', 'hotel', 'Dịch vụ đặt phòng khách sạn và resort', b'1'),
(3, 'Vé máy bay', 'flight', 'Vé máy bay nội địa và quốc tế', b'1'),
(4, 'Vé xe khách', 'bus', 'Vé xe khách, limousine và xe giường nằm', b'1'),
(5, 'Vé tàu hỏa', 'train', 'Vé tàu hỏa tuyến Bắc Nam và địa phương', b'1'),
(6, 'Du thuyền', 'cruise', 'Tour du thuyền, vịnh biển và sông nước', b'1'),
(7, 'Combo du lịch', 'travel-combo', 'Combo vé, phòng và lịch trình trọn gói', b'1'),
(8, 'Thuê xe', 'car-rental', 'Dịch vụ thuê xe tự lái và có tài xế', b'1'),
(9, 'Vé tham quan', 'attraction-ticket', 'Vé khu vui chơi, bảo tàng và điểm tham quan', b'1'),
(10, 'Tour trải nghiệm', 'experience', 'Ẩm thực, trekking, lặn biển và hoạt động địa phương', b'1'),
(11, 'Bảo hiểm du lịch', 'travel-insurance', 'Gói bảo hiểm cho chuyến đi', b'1'),
(12, 'Hướng dẫn viên', 'tour-guide', 'Dịch vụ hướng dẫn viên địa phương', b'1');

DROP PROCEDURE IF EXISTS seed_travel_services;

DELIMITER //
CREATE PROCEDURE seed_travel_services()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE providerId INT;
    DECLARE categoryId INT;
    DECLARE serviceName VARCHAR(100);
    DECLARE serviceDescription VARCHAR(255);
    DECLARE locationName VARCHAR(100);
    DECLARE departureName VARCHAR(100);
    DECLARE servicePrice BIGINT;
    DECLARE slots INT;
    DECLARE imageUrl VARCHAR(200);

    SELECT id INTO providerId FROM user WHERE username = 'provider' LIMIT 1;

    IF providerId IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tìm thấy tài khoản provider để gán dữ liệu mẫu.';
    END IF;

    WHILE i <= 100 DO
        SET categoryId = ((i - 1) MOD 12) + 1;
        SET locationName = CASE ((i - 1) MOD 20)
            WHEN 0 THEN 'Đà Lạt'
            WHEN 1 THEN 'Nha Trang'
            WHEN 2 THEN 'Hà Nội'
            WHEN 3 THEN 'Phú Quốc'
            WHEN 4 THEN 'Đà Nẵng'
            WHEN 5 THEN 'Hội An'
            WHEN 6 THEN 'Huế'
            WHEN 7 THEN 'Sa Pa'
            WHEN 8 THEN 'Hạ Long'
            WHEN 9 THEN 'Cần Thơ'
            WHEN 10 THEN 'Phan Thiết'
            WHEN 11 THEN 'Quy Nhơn'
            WHEN 12 THEN 'Vũng Tàu'
            WHEN 13 THEN 'Côn Đảo'
            WHEN 14 THEN 'Mộc Châu'
            WHEN 15 THEN 'Ninh Bình'
            WHEN 16 THEN 'Buôn Ma Thuột'
            WHEN 17 THEN 'Cao Bằng'
            WHEN 18 THEN 'Singapore'
            ELSE 'Bangkok'
        END;

        SET departureName = CASE ((i - 1) MOD 6)
            WHEN 0 THEN 'TP. Hồ Chí Minh'
            WHEN 1 THEN 'Hà Nội'
            WHEN 2 THEN 'Đà Nẵng'
            WHEN 3 THEN 'Cần Thơ'
            WHEN 4 THEN 'Nha Trang'
            ELSE 'Hải Phòng'
        END;

        SET imageUrl = CASE ((i - 1) MOD 10)
            WHEN 0 THEN 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
            WHEN 1 THEN 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee'
            WHEN 2 THEN 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1'
            WHEN 3 THEN 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff'
            WHEN 4 THEN 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'
            WHEN 5 THEN 'https://images.unsplash.com/photo-1493558103817-58b2924bce98'
            WHEN 6 THEN 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429'
            WHEN 7 THEN 'https://images.unsplash.com/photo-1501785888041-af3ef285b470'
            WHEN 8 THEN 'https://images.unsplash.com/photo-1518684079-3c830dcef090'
            ELSE 'https://images.unsplash.com/photo-1528127269322-539801943592'
        END;

        SET serviceName = CASE categoryId
            WHEN 1 THEN CONCAT('Tour ', locationName, ' ', 2 + (i MOD 4), ' ngày ', 1 + (i MOD 3), ' đêm')
            WHEN 2 THEN CONCAT('Khách sạn ', locationName, ' tiêu chuẩn ', 3 + (i MOD 3), ' sao')
            WHEN 3 THEN CONCAT('Vé máy bay ', departureName, ' - ', locationName)
            WHEN 4 THEN CONCAT('Xe khách ', departureName, ' - ', locationName)
            WHEN 5 THEN CONCAT('Vé tàu hỏa ', departureName, ' - ', locationName)
            WHEN 6 THEN CONCAT('Du thuyền khám phá ', locationName)
            WHEN 7 THEN CONCAT('Combo du lịch ', locationName, ' tiết kiệm')
            WHEN 8 THEN CONCAT('Thuê xe tham quan ', locationName)
            WHEN 9 THEN CONCAT('Vé tham quan ', locationName)
            WHEN 10 THEN CONCAT('Trải nghiệm địa phương tại ', locationName)
            WHEN 11 THEN CONCAT('Bảo hiểm du lịch chuyến ', locationName)
            ELSE CONCAT('Hướng dẫn viên tại ', locationName)
        END;

        SET serviceDescription = CASE categoryId
            WHEN 1 THEN CONCAT('Lịch trình tham quan ', locationName, ', bao gồm xe đưa đón, ăn uống cơ bản và hướng dẫn viên.')
            WHEN 2 THEN CONCAT('Phòng lưu trú tại ', locationName, ', tiện nghi sạch sẽ, phù hợp gia đình và nhóm bạn.')
            WHEN 3 THEN CONCAT('Vé máy bay tuyến ', departureName, ' đến ', locationName, ', hạng phổ thông, hành lý theo quy định.')
            WHEN 4 THEN CONCAT('Xe khách chất lượng cao tuyến ', departureName, ' đến ', locationName, ', ghế/giường nằm thoải mái.')
            WHEN 5 THEN CONCAT('Vé tàu hỏa tuyến ', departureName, ' đến ', locationName, ', phù hợp hành khách muốn di chuyển an toàn.')
            WHEN 6 THEN CONCAT('Hành trình du thuyền tại ', locationName, ', ngắm cảnh, ăn nhẹ và hoạt động giải trí trên tàu.')
            WHEN 7 THEN CONCAT('Combo du lịch ', locationName, ' gồm dịch vụ lưu trú, di chuyển và gợi ý lịch trình.')
            WHEN 8 THEN CONCAT('Dịch vụ thuê xe tại ', locationName, ', hỗ trợ lịch trình linh hoạt theo nhu cầu.')
            WHEN 9 THEN CONCAT('Vé vào cổng và tham quan các điểm nổi bật tại ', locationName, '.')
            WHEN 10 THEN CONCAT('Hoạt động trải nghiệm văn hóa, ẩm thực và thiên nhiên đặc trưng tại ', locationName, '.')
            WHEN 11 THEN CONCAT('Gói bảo hiểm hỗ trợ rủi ro cơ bản cho chuyến đi đến ', locationName, '.')
            ELSE CONCAT('Hướng dẫn viên am hiểu địa phương, hỗ trợ đoàn tham quan tại ', locationName, '.')
        END;

        SET servicePrice = CASE categoryId
            WHEN 1 THEN 1200000 + (i * 35000)
            WHEN 2 THEN 700000 + (i * 18000)
            WHEN 3 THEN 900000 + (i * 22000)
            WHEN 4 THEN 180000 + (i * 5000)
            WHEN 5 THEN 250000 + (i * 6000)
            WHEN 6 THEN 1500000 + (i * 40000)
            WHEN 7 THEN 2200000 + (i * 45000)
            WHEN 8 THEN 600000 + (i * 12000)
            WHEN 9 THEN 120000 + (i * 3000)
            WHEN 10 THEN 450000 + (i * 9000)
            WHEN 11 THEN 90000 + (i * 1000)
            ELSE 500000 + (i * 8000)
        END;

        SET slots = 10 + (i MOD 41);

        INSERT INTO travel_service
        (name, description, price, image, location, departure_location, departure_date, available_slots, status, created_date, category_id, provider_id)
        VALUES
        (serviceName, serviceDescription, servicePrice, imageUrl, locationName, departureName, DATE_ADD(CURDATE(), INTERVAL i DAY), slots, 'ACTIVE', NOW(), categoryId, providerId);

        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL seed_travel_services();
DROP PROCEDURE seed_travel_services;
