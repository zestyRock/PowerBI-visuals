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
	import SelectionManager = utility.SelectionManager;

    export interface CandleStickViewModel {
		dataPoints: CandleStickDataPoint[];
		tooltipInfo?: TooltipDataItem[];
	};

	export interface CandleStickDataPoint {
		date: Date;
		open: number;
		close: number;
		maxValue: number;
		minValue: number;
	};

    export class CandleStick implements IVisual {
		private static CandleStick: ClassAndSelector = createClassAndSelector('candlestick');
		private static date: string = "date";
		private static min: string = "min";
		private static open: string = "open";
		private static close: string = "close";
		private static max: string = "max";
		
		private selectionManager: SelectionManager;
		private element: JQuery;
		private svg: D3.Selection;

        private margin: IMargin = {
            top: 20,
            right: 0,
            bottom: 20,
            left: 40
        };
		private maxNumber: number = -Infinity;
        private minNumber: number = Infinity;
														   
        private converter(dataView: DataView): CandleStickViewModel {
	
			var parseDate = d3.time.format("%m/%d/%Y").parse; 
			var points: CandleStickDataPoint[] = [];
			var toolTip: TooltipDataItem[] = [];

			if (!dataView.table ||
                !dataView.table.rows) {
                return null;
            }

			var rawDataRows = dataView.table.rows;
			var colNames: string[] = [];

			dataView.metadata.columns.forEach(function (column) {
				colNames.push(column.queryName.toLowerCase());
			});				  
			
			var minValueArray = []; var maxValueArray = [];

			for (var i = 0; i < rawDataRows.length; i++) {
				var newPoint: CandleStickDataPoint = {
					date: new Date(),
					close: null,
					open: null,
					minValue: null,
					maxValue: null
				};
				var item = rawDataRows[i];

				newPoint.date = parseDate(item[colNames.indexOf(CandleStick.date)]);
				newPoint.close = item[colNames.indexOf(CandleStick.close)];
				newPoint.minValue = item[colNames.indexOf(CandleStick.min)];
				newPoint.maxValue = item[colNames.indexOf(CandleStick.max)];
				newPoint.open = item[colNames.indexOf(CandleStick.open)];

				points.push(newPoint);
				minValueArray.push(newPoint.minValue);
				maxValueArray.push(newPoint.maxValue);
			}
				  
			this.minNumber = _.min(minValueArray);
			this.maxNumber = _.max(maxValueArray);	  

            return {
				dataPoints: points
			};
        }

        public init(options: VisualInitOptions): void {
			this.element = options.element;
			this.selectionManager = new SelectionManager({ hostServices: options.host });
			this.svg = d3.select(this.element.get(0)).append("svg")
				.classed(CandleStick.CandleStick.class, true);
		}

        public update(options: VisualUpdateOptions) {
			if (!options.dataViews || !options.dataViews[0]) return;

            var w = options.viewport.width - this.margin.left - this.margin.right;
            var h = options.viewport.height - this.margin.top - this.margin.bottom;

			this.svg.selectAll("g, rect, line").remove();

            var model: CandleStickViewModel = this.converter(options.dataViews[0]);
            if (!model) {
                return;
            }

			this.draw(model, w, h);
		}

		private draw(model: CandleStickViewModel, w: number, h: number): void {
			this.svg.attr("width", w + this.margin.left + this.margin.right)
                .attr("height", h + this.margin.top + this.margin.bottom);
              
			var dataPoints = model.dataPoints;
			var valueFormat = "0";

			var xScale = d3.time.scale()
				.range([this.margin.left, w])
				.domain(d3.extent(dataPoints, function (point) { return point.date; }));

			var yScale = d3.scale.linear()
				.range([h, this.margin.bottom])
				.domain([this.minNumber, this.maxNumber]);

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
				.attr('transform', SVGUtil.translate(0, this.margin.top + h))
				.call(xAxis);

            this.svg.append("g")
				.attr("class", "y axis")
				.attr('transform', SVGUtil.translate(this.margin.left, this.margin.top))
				.call(yAxis);

			this.svg.selectAll("line.ext")
				.data(dataPoints)
				.enter()
				.append("svg:line")
				.attr("class", "ext")
				.attr("x1", function (d) { return xScale(d.date) })
				.attr("x2", function (d) { return xScale(d.date) })
				.attr("y1", function (d) { return yScale(d.minValue); })
				.attr("y2", function (d) { return yScale(d.maxValue); });

			this.svg.selectAll("line.ext1")
                .data(dataPoints)
                .enter()
				.append("svg:line")
                .attr("class", "ext")
                .attr("x1", function (d) { return xScale(d.date) + 3 })
                .attr("x2", function (d) { return xScale(d.date) - 3 })
                .attr("y1", function (d) { return yScale(d.minValue); })
                .attr("y2", function (d) { return yScale(d.minValue); });		 

            this.svg.selectAll("line.ext2")
                .data(dataPoints)
                .enter()
				.append("svg:line")
                .attr("class", "ext")
                .attr("x1", function (d) { return xScale(d.date) + 3 })
                .attr("x2", function (d) { return xScale(d.date) - 3 })
                .attr("y1", function (d) { return yScale(d.maxValue); })
                .attr("y2", function (d) { return yScale(d.maxValue); });	

            this.svg.selectAll("rect")    
				.data(dataPoints)
                .enter()
				.append("svg:rect")
                .attr("x", function (d) { return xScale(d.date) - 3; })
                .attr("y", function (d) { return yScale(Math.max(d.open, d.close)); })
                .attr("height", function (d) {
					return yScale(Math.min(d.open, d.close)) - yScale(Math.max(d.open, d.close));
				})
                .attr("width", 6)
                .attr("fill", function (d) {
					return d.open > d.close ? "red" : "green";
				});							 

			TooltipManager.addTooltip(this.svg.selectAll("rect"), (tooltipEvent: TooltipEvent) => {	
				return [
					{
                        displayName: "open",
                        value: tooltipEvent.data.open
                    },
                    {
                        displayName: "close",
                        value: tooltipEvent.data.close
                    },
                    {
						displayName: "date",
                        value: tooltipEvent.data.date
                    },
                    {
                        displayName: "max of the day",
                        value: tooltipEvent.data.maxValue
                    },
					{
                        displayName: "min of the day",
                        value: tooltipEvent.data.minValue
                    }
                ];
            }, true);

		}

        public destroy() {
			this.svg = null;
		}
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