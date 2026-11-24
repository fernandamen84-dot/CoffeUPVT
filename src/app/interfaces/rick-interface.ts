// 

export interface rickResponse{

    info:info;
    results:[];
}

//interface de ejemplo
export interface info{
    count:number;
    pages:number;
}

//interface para el personaje
export interface personaje{
    id:number;
    name:string;
    image:string;
}