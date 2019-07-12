CREATE SCHEMA `tiendademascotas` ;

CREATE TABLE `tiendademascotas`.`mascota` (
  `id` INT NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `edad` INT NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `tiendademascotas`.`mascota` 
CHANGE COLUMN `id` `id` INT(11) NOT NULL AUTO_INCREMENT ;
  
insert into `tiendademascotas`.`mascota` values(1,'Figaredo',2);
insert into `tiendademascotas`.`mascota` values(2,'Flunfli',4);

commit;