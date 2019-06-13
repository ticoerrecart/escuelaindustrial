CREATE SCHEMA `tiendademascotas` ;

CREATE TABLE `tiendademascotas`.`mascota` (
  `id` INT NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `edad` INT NULL,
  PRIMARY KEY (`id`));

  
insert into mascota values(1,'Figaredo',2);
insert into mascota values(2,'Flunfli',4);

commit;