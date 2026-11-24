import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { ColoresModulePageRoutingModule } from './colores.module-routing.module';

import { ColoresModulePage } from './colores.module.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ColoresModulePageRoutingModule
  ],
  declarations: [ColoresModulePage]
})
export class ColoresModulePageModule {}
