import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { TipoCartelera } from './entities/tipo-cartelera.entity';
import { Pelicula } from './entities/pelicula.entity';
import { Sala } from './entities/sala.entity';
import { Funcion } from './entities/funcion.entity';
import { CategoriasService } from './services/categorias.service';
import { TipoCarteleraService } from './services/tipo-cartelera.service';
import { PeliculasService } from './services/peliculas.service';
import { SalasService } from './services/salas.service';
import { FuncionesService } from './services/funciones.service';
import { CategoriasController } from './controllers/categorias.controller';
import { TipoCarteleraController } from './controllers/tipo-cartelera.controller';
import { PeliculasController } from './controllers/peliculas.controller';
import { SalasController } from './controllers/salas.controller';
import { FuncionesController } from './controllers/funciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria, TipoCartelera, Pelicula, Sala, Funcion])],
  controllers: [
    CategoriasController,
    TipoCarteleraController,
    PeliculasController,
    SalasController,
    FuncionesController,
  ],
  providers: [
    CategoriasService,
    TipoCarteleraService,
    PeliculasService,
    SalasService,
    FuncionesService,
  ],
})
export class FuncionesModule {}
