/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved. 
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *   
 *  The above copyright notice and this permission notice shall be included in 
 *  all copies or substantial portions of the Software.
 *   
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

/* Please make sure that this path is correct */
/// <reference path="../_references.ts"/>

module powerbi.visuals {
	import ClassAndSelector = jsCommon.CssConstants.ClassAndSelector;
	import createClassAndSelector = jsCommon.CssConstants.createClassAndSelector;

    export interface CandleStickViewModel {
		dataPoints: CandleStickDataPoint[];
		tooltipInfo?: TooltipDataItem[];
	};

	export interface CandleStickDataPoint {
		date: string;
		open: number;
		close: number;
		maxValue: number;
		minValue: number;
	};

    export class candleStick implements IVisual {
		private max: number = -Infinity;
        private min: number = Infinity;
		private static CandleStick: ClassAndSelector = createClassAndSelector('candlestick');
		private static date: string = "date";
		private static min: string = "min";
		private static open: string = "open";
		private static close: string = "close";
		private static max: string = "max";
		
		private element: JQuery;
		private svg: D3.Selection;
        private width: number;
        private height: number;
        private margin: IMargin = {
            top: 20,
            right: 0,
            bottom: 20,
            left: 60
        };

        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: "Category",
                    kind: VisualDataRoleKind.Grouping
                },
                {
                    name: "Y",
                    kind: VisualDataRoleKind.Measure
                }
            ],
            dataViewMappings: [{
                categorical: {
                    categories: {
                        for: { in: "Category" }
                    }
                }
            }]
        };

        
        private converter(dataView: DataView): CandleStickViewModel {
			var parseDate = d3.time.format("%m/%d/%Y").parse; 
			var points: CandleStickDataPoint[] = [];

			if (!dataView.categorical ||
                !dataView.categorical.categories ||
                !dataView.categorical.categories[0] ||
                !dataView.categorical.categories[0].values ||
                !(dataView.categorical.categories[0].values.length > 0)) {
                return null;
            }

			var rawDataRows = dataView.table.rows;
			var colNames: string[] = [];

			dataView.metadata.columns.forEach(function (column) {
				colNames.push(column.queryName.toLowerCase());
			});

			rawDataRows.forEach(function (item) {
				var newPoint: CandleStickDataPoint;
				newPoint.date = this.parseDate(item[colNames.indexOf(candleStick.date)]);
				newPoint.close = item[colNames.indexOf(candleStick.close)];
				newPoint.minValue = item[colNames.indexOf(candleStick.min)];
				if (newPoint.minValue < this.min) {
					this.min = newPoint.minValue;
				}
				newPoint.maxValue = item[colNames.indexOf(candleStick.max)];

				if (newPoint.maxValue > this.max) {
					this.max = newPoint.maxValue;
				}
				newPoint.open = item[colNames.indexOf(candleStick.open)];
				points.push(newPoint);
			});
			
            return {
				dataPoints: points
			};
        }

        public init(options: VisualInitOptions): void {
			this.svg = d3.select(this.element.get(0)).append("svg").classed(candleStick.CandleStick.class, true);
			
        }

        public update(options: VisualUpdateOptions) {
			if (!options.dataViews || !options.dataViews[0]) return;

            var w = options.viewport.width - this.margin.left - this.margin.right;
            var h = options.viewport.height - this.margin.top - this.margin.bottom;

            if (this.svg.selectAll("g").length !== 0) {
                this.svg.selectAll("g").remove();
            }
            var model: CandleStickViewModel = this.converter(options.dataViews[0]);
            if (!model) {
                return;
            }

			this.draw(model, w, h);
		}

		private draw(model: CandleStickViewModel, w: number, h: number): void {
			this.svg.attr("width", w + this.margin.left + this.margin.right)
                .attr("height", h + this.margin.top + this.margin.bottom)
                .attr('transform', SVGUtil.translate(this.margin.left, this.margin.top));

			var dataPoints = model.dataPoints;

			var xScale = d3.time.scale()
				.range([0, w])
				.domain(d3.extent(dataPoints, function (point) { return point.date; }));

			var yScale = d3.scale.linear()
				.range([h, 0])
				.domain([this.min, this.max]);

			var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom")
				.tickFormat(d3.time.format("%d-%b"))
				.ticks(5);

			var yAxis = d3.svg.axis()
				.scale(yScale)
				.orient("left");

			this.svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + h + ")")
				.call(xAxis);


            this.svg.append("g")
				.attr("class", "y axis")
				.call(yAxis);

			this.svg.selectAll("line.ext")
				.data(dataPoints)
				.enter()
				.append("svg:line")
				.attr("class", "ext")
				.attr("x1", function (d) { return xScale(d.date) })
				.attr("x2", function (d) { return xScale(d.date) })
				.attr("y1", function (d) { return yScale(d.min); })
				.attr("y2", function (d) { return yScale(d.max); });

			this.svg.selectAll("line.ext1")
                .data(dataPoints)
                .enter().append("svg:line")
                .attr("class", "ext")
                .attr("x1", function (d) { return xScale(d.date) + 3 })
                .attr("x2", function (d) { return xScale(d.date) - 3 })
                .attr("y1", function (d) { return yScale(d.min); })
                .attr("y2", function (d) { return yScale(d.min); });


            this.svg.selectAll("line.ext2")
                .data(dataPoints)
                .enter().append("svg:line")
                .attr("class", "ext")
                .attr("x1", function (d) { return xScale(d.date) + 3 })
                .attr("x2", function (d) { return xScale(d.date) - 3 })
                .attr("y1", function (d) { return yScale(d.max); })
                .attr("y2", function (d) { return yScale(d.max); });


            this.svg.selectAll("rect")
                .data(dataPoints)
                .enter().append("svg:rect")
                .attr("x", function (d) { return xScale(d.date) - 3; })
                .attr("y", function (d) { return yScale(Math.max(d.open, d.close)); })
                .attr("height", function (d) {
					return yScale(Math.min(d.open, d.close)) - yScale(Math.max(d.open, d.close));
				})
                .attr("width", 6)
                .attr("fill", function (d) {
					return d.open > d.close ? "red" : "green";
				});
		}

        public destroy() {}
    }
}

/* Creating IVisualPlugin that is used to represent IVisual. */
//
// Uncomment it to see your plugin in "PowerBIVisualsPlayground" plugins list
// Remember to finally move it to plugins.ts
//
//module powerbi.visuals.plugins {
//    export var candleStick: IVisualPlugin = {
//        name: 'CandleStick',
//        capabilities: CandleStick.capabilities,
//        create: () => new CandleStick()
//    };
//}