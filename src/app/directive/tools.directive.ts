import { Directive, EventEmitter, Input, Output } from '@angular/core';

@Directive({
  selector: '[appTools]'
})
export class ToolsDirective {

  @Input() isLast: boolean | undefined;

  @Output('ngInit') initEvent: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    if (this.isLast) {
      setTimeout(() => this.initEvent.emit(), 10);
    }
  }

}
