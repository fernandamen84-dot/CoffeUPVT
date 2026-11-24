import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { ModalModulePageRoutingModule } from './modal.module-routing.module';

import { ModalModulePage } from './modal.module.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalModulePageRoutingModule
  ],
  declarations: [ModalModulePage]
})
export class ModalModulePageModule {}
