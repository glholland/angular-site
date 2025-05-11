import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  template: `
    <header>
      <h1>Welcome to {{title}}!</h1>
      <p>A simple Angular application example</p>
    </header>
    
    <main>
      <div class="card">
        <h2>Hello World!</h2>
        <p>This is a sample Angular application showing basic components and styling.</p>
        <button (click)="incrementCounter()">Click me: {{counter}}</button>
      </div>
      
      <div class="features">
        <div class="feature" *ngFor="let feature of features">
          <h3>{{feature.title}}</h3>
          <p>{{feature.description}}</p>
        </div>
      </div>
    </main>
    
    <footer>
      <p>&copy; {{currentYear}} Angular Hello World Example</p>
    </footer>

    <router-outlet />
  `,
  styles: [`
    header {
      background-color: #1976d2;
      color: white;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
      border-radius: 5px;
    }
    
    main {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .card {
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    button {
      background-color: #1976d2;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    
    button:hover {
      background-color: #1565c0;
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .feature {
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    footer {
      margin-top: 40px;
      text-align: center;
      padding: 20px;
      background-color: #f1f1f1;
      border-radius: 5px;
    }
  `],
})
export class AppComponent {
  title = 'Hello World App';
  counter = 0;
  currentYear = new Date().getFullYear();
  
  features = [
    {
      title: 'Component-Based',
      description: 'Angular uses components to build modular applications'
    },
    {
      title: 'Powerful Templating',
      description: 'Create dynamic views with Angular\'s template syntax'
    },
    {
      title: 'Reactive Programming',
      description: 'Handle asynchronous operations efficiently with RxJS'
    }
  ];

  incrementCounter() {
    this.counter++;
  }
}
  