import { Component, OnDestroy } from "@angular/core";
import { Subscription, timer } from "rxjs";

type Cell = "dead" | "alive";
type Row = Cell[];
type Game = Row[];

const DEFAULT_GRID = 50;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnDestroy {
  public game: Game;
  public iteratingManually = true;
  public gridSize = DEFAULT_GRID;
  public inputError = "";

  private subscription?: Subscription;
  private currentTimer = 100;

  constructor() {
    this.game = this.constructGame();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  goToNextIteration() {
    this.game = this.nextStep(this.game);
  }

  onInputChange() {
    if (this.gridSize > 100 || this.gridSize < 0) {
      this.inputError = "Grid size must be between 0 and 100";
      setTimeout(() => (this.gridSize = DEFAULT_GRID));
      setTimeout(() => (this.inputError = ""), 3000);
    }
  }

  runManually() {
    this.subscription?.unsubscribe();
    this.iteratingManually = true;
  }

  runAutomatically() {
    this.subscription?.unsubscribe();
    this.subscription = timer(0, this.currentTimer).subscribe(() =>
      this.goToNextIteration()
    );
    this.iteratingManually = false;
  }

  slower() {
    if (this.currentTimer < 100000) {
      this.currentTimer *= 2;
    }
    this.runAutomatically();
  }

  faster() {
    if (this.currentTimer > 1) {
      this.currentTimer = Math.floor(this.currentTimer / 2);
    }
    this.runAutomatically();
  }

  reset() {
    this.runManually();
    this.game = this.constructGame();
  }

  private constructGame(): Game {
    const game: Game = [];
    for (let i = 0; i < this.gridSize; i++) {
      game.push(this.constructRow());
    }
    return game;
  }

  private constructRow(): Row {
    const row: Row = [];
    for (let j = 0; j < this.gridSize; j++) {
      const cell: Cell = this.isGeneratedAlive() ? "alive" : "dead";
      row.push(cell);
    }
    return row;
  }

  private isGeneratedAlive(): boolean {
    return Math.floor(Math.random() * 2) === 1;
  }

  private nextStep(game: Game): Game {
    const next: Game = [];
    game.forEach((row, i) => {
      const nextRow = this.analiseRow({ row, y: i });
      next.push(nextRow);
    });
    return next;
  }

  private analiseRow(opts: { row: Row; y: number }): Row {
    const next: Row = [];
    opts.row.forEach((cell, i) => {
      const nextCell = this.analiseCell({
        cell,
        y: opts.y,
        x: i,
      });
      next.push(nextCell);
    });
    return next;
  }

  private analiseCell(opts: { cell: Cell; y: number; x: number }): Cell {
    let totalAdjacentCellsAlive = 0;

    for (let y = opts.y - 1; y <= opts.y + 1; y++) {
      const row = this.game[this.getAbsolute(y)];

      for (let x = opts.x - 1; x <= opts.x + 1; x++) {
        if (y !== opts.y || x !== opts.x) {
          const cell = row[this.getAbsolute(x)];

          if (this.isCellAlive(cell)) {
            totalAdjacentCellsAlive++;
          }
        }
      }
    }

    if (this.isCellAlive(opts.cell)) {
      if (totalAdjacentCellsAlive < 2) {
        return "dead";
      }
      if (totalAdjacentCellsAlive <= 3) {
        return "alive";
      }
      return "dead";
    }
    if (totalAdjacentCellsAlive === 3) {
      return "alive";
    }
    return "dead";
  }

  private getAbsolute(x: number): number {
    if (x < 0) {
      return this.gridSize - 1;
    }
    if (x > this.gridSize - 1) {
      return 0;
    }
    return x;
  }

  private isCellAlive(cell: Cell): boolean {
    return cell === "alive";
  }
}
