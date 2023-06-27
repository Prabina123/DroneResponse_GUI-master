import { BehaviorSubject, Observable } from "rxjs";
import { DroneDrag } from "../model/Drone";

export class GlobalService {
    public dragData = new BehaviorSubject<DroneDrag>({
        isDragging: false,
        drone: undefined,
        regions: [],
        routes: [],
    });

    getDragData(): Observable<DroneDrag> {
        return this.dragData.asObservable();
    }

    setDragData(newDragData: DroneDrag): void {
        const oldData = this.dragData.getValue();
        this.dragData.next({ ...oldData, ...newDragData });
    }

}