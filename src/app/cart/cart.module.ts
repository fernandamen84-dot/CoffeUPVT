import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { CartPageRoutingModule } from './cart-routing.module';

import { CartPage } from './cart.page';
import {MatSlideToggle} from '@angular/material/slide-toggle';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CartPageRoutingModule,
    MatSlideToggle
  

  ],
  declarations: [CartPage]
})
export class CartPageModule {}
