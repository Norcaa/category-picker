export interface CategoryFace {
    id?: string,
    name: string,
    selected: boolean,
    children?: CategoryFace[];
}