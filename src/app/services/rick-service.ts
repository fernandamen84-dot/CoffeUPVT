import { inject, Service } from '@angular/core';
import{HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Observable } from 'rxjs';
import { rickResponse } from '../interfaces/rick-interface';


@Service()

export class RickService {

   private http = inject(HttpClient)
    

   getPersonajes(): Observable<rickResponse> {
        return this.http.get<rickResponse>(environment.URL_BASE + environment.personajes)
    }
}
















