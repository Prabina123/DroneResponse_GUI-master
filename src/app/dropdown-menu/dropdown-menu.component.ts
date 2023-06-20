import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { GraphvizParseDataService } from '../services/graphviz-service/graphviz-parse-data.service';

@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.less'],
})
export class DropdownMenuComponent implements OnInit {
  @Input() currentLocation: string;

  menuVisible = false;
  menuIcon = faBars;
  obs: Subscription;
  noMission: boolean;

  constructor(
    private router: Router,
    private graphvizParseDataService: GraphvizParseDataService
  ) { }

  ngOnInit(): void {
    this.noMission = this.graphvizParseDataService.getClickable();
  }

  setMenuVisible(): void {
    this.menuVisible = false;
  }

  toggleMenu(): void {
    this.menuVisible = !this.menuVisible;
  }

  // Navigate to configuration/connection pages
  configNavigate(location: string) {
    this.router.navigate(['/' + location]);
  }

  isActive(page: string): boolean {
    let path = this.router.url;
    return path == page;
  }
}
