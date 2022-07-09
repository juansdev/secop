import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-extension-panel',
  templateUrl: './extension-panel.component.html',
  styleUrls: ['./extension-panel.component.css']
})
export class ExtensionPanelComponent implements OnInit {

  @Output() department_selected = new EventEmitter<string>();

  @Input() name_departments: Array<string> = [];
  extension_panel_vertical: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

  change_state_extension_panel_vertical() {
    this.extension_panel_vertical = !this.extension_panel_vertical;
  }
}
