import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart.html',
  styleUrl: './chart.css',
})
export class PerformanceChartComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() performanceData: any[] = [];

  private chartInstance: Chart | null = null;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['performanceData'] && this.viewReady) {
      this.buildChart();
    }
  }

  ngOnDestroy(): void {
    this.chartInstance?.destroy();
  }

  buildChart(): void {
  if (!this.viewReady || !this.chartCanvas?.nativeElement || !this.performanceData?.length) {
    return;
  }

  const labels = this.performanceData.map((d) =>
    d.assignment ?? d.title ?? d.assignment_title ?? 'Unknown Assignment'
  );

  const scores = this.performanceData.map((d) =>
    Number(d.percentage ?? d.grade ?? d.score ?? d.average_score ?? 0)
  );

  const backgroundColors = scores.map((s) => {
    if (s >= 80) return 'rgba(72, 199, 142, 0.85)';
    if (s >= 60) return 'rgba(255, 183, 77, 0.85)';
    return 'rgba(255, 107, 107, 0.85)';
  });

  const borderColors = scores.map((s) => {
    if (s >= 80) return 'rgb(52, 168, 120)';
    if (s >= 60) return 'rgb(230, 160, 50)';
    return 'rgb(230, 80, 80)';
  });

  if (this.chartInstance) {
    this.chartInstance.destroy();
    this.chartInstance = null;
  }

  this.chartInstance = new Chart(this.chartCanvas.nativeElement, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Performance (%)',
          data: scores,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            color: '#888',
            font: { size: 12 },
            callback: (value: string | number): string => `${value}%`,   // ← Fixed here
          },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        x: {
          ticks: {
            color: '#94a3b8',
            font: { size: 11 },
          },
          grid: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(22, 27, 34, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#94a3b8',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            title: (tooltipItems) => {
              const index = tooltipItems[0].dataIndex;
              return labels[index];
            },
            label: (tooltipItem) => ` Score: ${tooltipItem.parsed.y}%`,
            afterLabel: (tooltipItem) => {
              const index = tooltipItem.dataIndex;
              const item = this.performanceData[index];
              return item.course_name || item.courseName 
                ? ` Course: ${item.course_name || item.courseName}` 
                : '';
            },
          },
        },
      },
      animation: { duration: 800, easing: 'easeOutQuart' },
    },
  });
}
}