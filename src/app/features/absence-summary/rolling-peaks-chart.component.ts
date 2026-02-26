import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  ViewChild
} from '@angular/core';
import * as d3 from 'd3';
import { I18nService } from '../../i18n/i18n.service';
import { ILR_MAX_ABSENCE_ROLLING_12M } from '../../policy/thresholds';

export interface YearlyAbsenceChartPoint {
  year: number;
  daysOutside: number;
}

@Component({
  selector: 'app-rolling-peaks-chart',
  standalone: true,
  template: `
    <figure class="chart-shell">
      <svg #chart [attr.aria-label]="i18n.t('rollingChart.ariaLabel')"></svg>
    </figure>
  `,
  styles: [
    `
      .chart-shell {
        margin: 0.8rem 0 0;
        border: 1px solid #d3e1ea;
        border-radius: 12px;
        padding: 0.5rem;
        background: #f9fcff;
      }

      svg {
        width: 100%;
        height: 220px;
        display: block;
      }
    `
  ]
})
export class RollingPeaksChartComponent implements AfterViewInit, OnChanges {
  protected readonly i18n = inject(I18nService);
  @Input({ required: true }) yearlyData: YearlyAbsenceChartPoint[] = [];
  @Input() maxAllowedDays = ILR_MAX_ABSENCE_ROLLING_12M;
  @ViewChild('chart') private chartRef?: ElementRef<SVGSVGElement>;

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(): void {
    this.render();
  }

  private render(): void {
    const svgElement = this.chartRef?.nativeElement;
    if (!svgElement) {
      return;
    }

    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    if (this.yearlyData.length === 0) {
      return;
    }

    const width = 520;
    const height = 240;
    const margin = { top: 14, right: 18, bottom: 40, left: 44 };
    const points = [...this.yearlyData].sort((left, right) => left.year - right.year);
    const labels = points.map((point) => String(point.year));

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');

    const x = d3
      .scaleBand<string>()
      .domain(labels)
      .range([margin.left, width - margin.right])
      .padding(0.25);

    const maxDays = d3.max(points, (point) => point.daysOutside) ?? 0;
    const y = d3
      .scaleLinear()
      .domain([0, Math.max(1, maxDays, this.maxAllowedDays)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const bars = svg
      .append('g')
      .attr('fill', '#2f6792')
      .selectAll('rect')
      .data(points)
      .join('rect')
      .attr('class', 'days-bar')
      .attr('x', (point) => x(String(point.year)) ?? margin.left)
      .attr('y', (point) => y(point.daysOutside))
      .attr('width', x.bandwidth())
      .attr('height', (point) => y(0) - y(point.daysOutside))
      .attr('rx', 4);

    bars
      .append('title')
      .text((point) => this.i18n.t('rollingChart.barTitle', { year: point.year, days: point.daysOutside }));

    const thresholdY = y(this.maxAllowedDays);
    svg
      .append('line')
      .attr('class', 'threshold-line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', thresholdY)
      .attr('y2', thresholdY)
      .attr('stroke', '#a13f1d')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5 4');

    svg
      .append('text')
      .attr('x', width - margin.right)
      .attr('y', thresholdY - 6)
      .attr('text-anchor', 'end')
      .attr('fill', '#7f2f16')
      .attr('font-size', 11)
      .text(this.i18n.t('rollingChart.allowedMax', { days: this.maxAllowedDays }));

    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .call((group) => group.select('.domain').attr('stroke', '#5d7381'));

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .call((group) => group.select('.domain').attr('stroke', '#5d7381'));
  }
}
