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

/// <reference path="../../_references.ts"/>

module powerbi.visuals.samples {

    import ClassAndSelector = jsCommon.CssConstants.ClassAndSelector;
    import createClassAndSelector = jsCommon.CssConstants.createClassAndSelector;
    //import visualsAxisLinesVisibility = powerbi.visuals.AxisLinesVisibility;
    enum AxisLinesVisibility {
        ShowLinesOnXAxis = 1,
        ShowLinesOnYAxis = 2,
        ShowLinesOnBothAxis = ShowLinesOnXAxis | ShowLinesOnYAxis,
    }
    
    export const enum MekkoChartType {
        HundredPercentStackedColumn,
    }

    export interface MekkoConstructorOptions {
        chartType: MekkoChartType;
        isScrollable?: boolean;
        animator?: IGenericAnimator;
        cartesianSmallViewPortProperties?: CartesianSmallViewPortProperties;
        behavior?: IInteractiveBehavior;
        seriesLabelFormattingEnabled?: boolean;
    }

    export class MekkoChartStrategy implements IColumnChartStrategy {
        private static classes = {
            item: <ClassAndSelector>createClassAndSelector('column'),
            highlightItem: <ClassAndSelector>createClassAndSelector('highlightColumn')
        };

        private data: ColumnChartData;
        private graphicsContext: ColumnChartContext;
        private width: number;
        private height: number;
        private margin: IMargin;
        private xProps: IAxisProperties;
        private yProps: IAxisProperties;
        private categoryLayout: CategoryLayout;
        private columnsCenters: number[];
        private columnSelectionLineHandle: D3.Selection;
        private animator: IColumnChartAnimator;
        private interactivityService: IInteractivityService;
        private viewportHeight: number;
        private viewportWidth: number;
        private static validLabelPositions: RectLabelPosition[] = [RectLabelPosition.InsideCenter, RectLabelPosition.InsideEnd, RectLabelPosition.InsideBase];
        private layout: IColumnLayout;

        public setupVisualProps(columnChartProps: ColumnChartContext): void {
            this.graphicsContext = columnChartProps;
            this.margin = columnChartProps.margin;
            this.width = this.graphicsContext.width;
            this.height = this.graphicsContext.height;
            this.categoryLayout = columnChartProps.layout;
            this.animator = columnChartProps.animator;
            this.interactivityService = columnChartProps.interactivityService;
            this.viewportHeight = columnChartProps.viewportHeight;
            this.viewportWidth = columnChartProps.viewportWidth;
        }

        public setData(data: ColumnChartData) {
            this.data = data;
        }

 /*
       private getValueAxis(
            data: ColumnChartData,
            is100Pct: boolean,
            size: number,
            scaleRange: number[],
            forcedTickCount?: number,
            forcedYDomain?: any[],
            axisScaleType?: string): IAxisProperties {

            console.clear();
            
       
            
            var valueDomain = data.series[0].data.map((item: ColumnChartDataPoint) => {
                return item.originalPosition;
            });
            
            var min = 0;
            var max = 1;
            
            console.log('valueDomain', valueDomain);
            console.log('scaleRange', scaleRange);
            
            var maxTickCount = AxisHelper.getRecommendedNumberOfTicksForYAxis(size);
            maxTickCount = valueDomain.length;
            var bestTickCount = ColumnUtil.getTickCount(min, max, data.valuesMetadata, maxTickCount, is100Pct, forcedTickCount);
            bestTickCount = valueDomain.length;
            var normalizedRange = AxisHelper.normalizeLinearDomain({ min: min, max: max });
            var valueDomainNorm = [normalizedRange.min, normalizedRange.max];
            var axisType = ValueType.fromDescriptor({ text: true });

            console.log('valueDomainNorm', valueDomainNorm);

            var combinedDomain = AxisHelper.combineDomain(forcedYDomain, valueDomainNorm);  
            var isLogScaleAllowed = AxisHelper.isLogScalePossible(combinedDomain, axisType);                                  
            var useLogScale = axisScaleType && axisScaleType === axisScale.log && isLogScaleAllowed;

            var scale = useLogScale ? d3.scale.log() : d3.scale.linear();
            
            console.log('combinedDomain', combinedDomain);
            console.log('isLogScaleAllowed', isLogScaleAllowed);
            console.log('useLogScale', useLogScale);

            scale.range(scaleRange)
                .domain(combinedDomain)
                .nice(bestTickCount || undefined)
                .clamp(AxisHelper.scaleShouldClamp(combinedDomain, valueDomainNorm));     

            ColumnUtil.normalizeInfinityInScale(scale);
            
            var xMetadata = data.categoryMetadata;
            var dataType: ValueType = AxisHelper.getCategoryValueType(xMetadata, true);
            var formatString = valueFormatter.getFormatString(xMetadata, columnChartProps.general.formatString);
            var minTickInterval = AxisHelper.getMinTickValueInterval(formatString, dataType);
            var yTickValues: any[] = AxisHelper.getRecommendedTickValuesForAQuantitativeRange(bestTickCount, scale, minTickInterval);
            
            console.log('xMetadata', xMetadata);
            console.log('dataType', dataType);
            console.log('formatString', formatString);
            console.log('minTickInterval', minTickInterval);
            console.log('yTickValues', yTickValues);
            
            if (useLogScale) {
                yTickValues = yTickValues.filter((d) => { return AxisHelper.powerOfTen(d); });
            }
            console.log('yTickValues', yTickValues);

            var d3Axis = d3.svg.axis()
                .scale(scale)
                .tickValues(yTickValues);

            var yInterval = ColumnChart.getTickInterval(yTickValues);
            var yFormatter = StackedUtil.createValueFormatter(
                data.valuesMetadata,
                is100Pct,
                yInterval);
            d3Axis.tickFormat(yFormatter.format);
            
            console.log('yInterval', yInterval);
            
            console.log('data.valuesMetadata', data.valuesMetadata);
            console.log('yFormatter', yFormatter);

            var values = yTickValues.map((d: ColumnChartDataPoint) => yFormatter.format(d));            

            return {
                axis: d3Axis,
                scale: scale,
                formatter: yFormatter,
                values: values,
                axisType: axisType,
                axisLabel: null,
                isCategoryAxis: false,
                isLogScaleAllowed: isLogScaleAllowed
            };
        }
        */     
                
        private static createFormatter(
            scaleDomain: any[],
            dataDomain: any[],
            dataType,
            isScalar: boolean,
            formatString: string,
            bestTickCount: number,
            tickValues: any[],
            getValueFn: any,
            useTickIntervalForDisplayUnits: boolean = false): IValueFormatter {

            var formatter: IValueFormatter;
            if (dataType.dateTime) {
                if (isScalar) {
                    var value = new Date(scaleDomain[0]);
                    var value2 = new Date(scaleDomain[1]);
                    // datetime with only one value needs to pass the same value
                    // (from the original dataDomain value, not the adjusted scaleDomain)
                    // so formatting works correctly.
                    if (bestTickCount === 1)
                        value = value2 = new Date(dataDomain[0]);
                    formatter = valueFormatter.create({ format: formatString, value: value, value2: value2, tickCount: bestTickCount });
                }
                else {
                    if (getValueFn == null) {
                        debug.assertFail('getValueFn must be supplied for ordinal datetime tickValues');
                    }
                    var minDate: Date = getValueFn(0, dataType);
                    var maxDate: Date = getValueFn(scaleDomain.length - 1, dataType);
                    formatter = valueFormatter.create({ format: formatString, value: minDate, value2: maxDate, tickCount: bestTickCount });
                }
            }
            else {
                if (getValueFn == null && !isScalar) {
                    debug.assertFail('getValueFn must be supplied for ordinal tickValues');
                }
                if (useTickIntervalForDisplayUnits && isScalar && tickValues.length > 1) {
                    var domainMin = tickValues[1] - tickValues[0];
                    var domainMax = 0; //force tickInterval to be used with display units
                    formatter = valueFormatter.create({ format: formatString, value: domainMin, value2: domainMax, allowFormatBeautification: true });
                }
                else {
                    // do not use display units, just the basic value formatter
                    // datetime is handled above, so we are ordinal and either boolean, numeric, or text.
                    formatter = valueFormatter.createDefaultFormatter(formatString, true);
                }
            }

            return formatter;
        }
        
        /**
         * Create a D3 axis including scale. Can be vertical or horizontal, and either datetime, numeric, or text.
         * @param options The properties used to create the axis.
         */
        private createAxis(options): IAxisProperties {
            var pixelSpan = options.pixelSpan,
                dataDomain = options.dataDomain,
                metaDataColumn = options.metaDataColumn,
                formatStringProp = options.formatStringProp,
                outerPadding = options.outerPadding || 0,
                isCategoryAxis = !!options.isCategoryAxis,
                isScalar = !!options.isScalar,
                isVertical = !!options.isVertical,
                useTickIntervalForDisplayUnits = !!options.useTickIntervalForDisplayUnits, // DEPRECATE: same meaning as isScalar?
                getValueFn = options.getValueFn,
                categoryThickness = options.categoryThickness;

            var formatString = valueFormatter.getFormatString(metaDataColumn, formatStringProp);
            var dataType: ValueType = AxisHelper.getCategoryValueType(metaDataColumn, isScalar);
            
           /* console.clear();
            console.log('dataDomain', dataDomain);
            console.log('formatString', formatString);
            console.log('dataType', dataType);     */   
            // Create the Scale
          /*  var scaleResult: CreateScaleResult = AxisHelper.createScale(options);
            var scale = scaleResult.scale;
            var bestTickCount = scaleResult.bestTickCount;
            var scaleDomain = scale.domain();
            
            console.log('scaleResult', scaleResult);
            console.log('scale', scale);   
            console.log('bestTickCount', bestTickCount);   
            console.log('scaleDomain', scaleDomain);   
           */
            
            var isLogScaleAllowed = AxisHelper.isLogScalePossible(dataDomain, dataType);
          
            //var bestTickCount 
           var scale = d3.scale.linear();
            
            var scaleDomain = [0, 10];
            var bestTickCount = dataDomain.length;
            
            
            scale.domain([0, 1])
                .range([0, pixelSpan])
                //.nice(bestTickCount || undefined)
                //.clamp(AxisHelper.scaleShouldClamp([0, 10], [0, 10]));     

  /*
    
            console.log('range', [0, pixelSpan]);
            console.log('bestTickCount', bestTickCount);
            console.log('scale.range', scale.range());
            
            
            console.log('scale.dataDomain1', dataDomain[1], scale(dataDomain[1]));
            console.log('scale.dataDomain2', dataDomain[2], scale(dataDomain[2]));
            */

            var tickValues = dataDomain;
           // console.log('minTickInterval', minTickInterval);   
           // console.log('tickValues', tickValues);   

            var formatter = MekkoChartStrategy.createFormatter(
                scaleDomain,
                dataDomain,
                dataType,
                isScalar,
                formatString,
                bestTickCount,
                tickValues,
                getValueFn,
                useTickIntervalForDisplayUnits);

            // sets default orientation only, cartesianChart will fix y2 for comboChart
            // tickSize(pixelSpan) is used to create gridLines
            var axis = d3.svg.axis()
                .scale(scale)
                .tickSize(6, 0)
                .orient(isVertical ? 'left' : 'bottom')
                .ticks(bestTickCount)
                .tickValues(dataDomain);

            var formattedTickValues = [];
            if (metaDataColumn) {
                formattedTickValues = AxisHelper.formatAxisTickValues(axis, tickValues, formatter, dataType, isScalar, getValueFn);
            }
            
            //console.log('formattedTickValues', formattedTickValues);
            var xLabelMaxWidth;
            // Use category layout of labels if specified, otherwise use scalar layout of labels
            if (!isScalar && categoryThickness) {
                xLabelMaxWidth = Math.max(1, categoryThickness - CartesianChart.TickLabelPadding * 2);
            }
            else {
                // When there are 0 or 1 ticks, then xLabelMaxWidth = pixelSpan       
                // When there is > 1 ticks then we need to +1 so that their widths don't overlap
                // Example: 2 ticks are drawn at 33.33% and 66.66%, their width needs to be 33.33% so they don't overlap.
                var labelAreaCount = tickValues.length > 1 ? tickValues.length + 1 : tickValues.length;
                xLabelMaxWidth = labelAreaCount > 1 ? pixelSpan / labelAreaCount : pixelSpan;
                xLabelMaxWidth = Math.max(1, xLabelMaxWidth - CartesianChart.TickLabelPadding * 2);
            }
                
            return {
                scale: scale,
                axis: axis,
                formatter: formatter,
                values: formattedTickValues,
                axisType: dataType,
                axisLabel: null,
                isCategoryAxis: isCategoryAxis,
                xLabelMaxWidth: xLabelMaxWidth,
                categoryThickness: categoryThickness,
                outerPadding: outerPadding,
                usingDefaultDomain: false,//scaleResult.usingDefaultDomain,
                isLogScaleAllowed: isLogScaleAllowed
            };
        }
        
        
        
        private getCategoryAxis(
            data: ColumnChartData,
            size: number,
            layout: CategoryLayout,
            isVertical: boolean,
            forcedXMin?: DataViewPropertyValue,
            forcedXMax?: DataViewPropertyValue,
            axisScaleType?: string): IAxisProperties {

            var categoryThickness = layout.categoryThickness;
            var isScalar = layout.isScalar;
            var outerPaddingRatio = layout.outerPaddingRatio;
            var dw = new DataWrapper(data, isScalar);
            //var domain = AxisHelper.createDomain(data.series, data.categoryMetadata ? data.categoryMetadata.type : ValueType.fromDescriptor({ text: true }), isScalar, [forcedXMin, forcedXMax]);

            var domain = data.series[0].data.map((item: ColumnChartDataPoint) => {
                return item.originalPosition + item.value / 2;
            });
           
            var axisProperties = this.createAxis({
                pixelSpan: size,
                dataDomain: domain,
                metaDataColumn: data.categoryMetadata,
                formatStringProp: columnChartProps.general.formatString,
                outerPadding: categoryThickness * outerPaddingRatio,
                isCategoryAxis: true,
                isScalar: isScalar,
                isVertical: isVertical,
                categoryThickness: categoryThickness,
                useTickIntervalForDisplayUnits: true,
                getValueFn: (index, type) => {
                    
                    var domainIndex = domain.indexOf(index);
                    //console.log('getValueFn', index, domainIndex, dw.lookupXValue(domainIndex, type));
                    return dw.lookupXValue(domainIndex, type);
                },
                scaleType: axisScaleType
            });

            // intentionally updating the input layout by ref
            layout.categoryThickness = axisProperties.categoryThickness;

            return axisProperties;
        }
        
        public setXScale(is100Pct: boolean, forcedTickCount?: number, forcedXDomain?: any[], axisScaleType?: string): IAxisProperties {
            var width = this.width;

            var forcedXMin, forcedXMax;

            if (forcedXDomain && forcedXDomain.length === 2) {
                forcedXMin = forcedXDomain[0];
                forcedXMax = forcedXDomain[1];
            }


            var props = this.xProps = this.getCategoryAxis(
                this.data,
                width,
                this.categoryLayout,
                false,
                forcedXMin,
                forcedXMax,
                axisScaleType);
                
            return props;
        }
        

        public setYScale(is100Pct: boolean, forcedTickCount?: number, forcedYDomain?: any[], axisScaleType?: string): IAxisProperties {
            var height = this.viewportHeight;
            var yProps = this.yProps = StackedUtil.getValueAxis(
                this.data,
                is100Pct,
                height,
                [height, 0],
                forcedTickCount,
                forcedYDomain,
                axisScaleType);

            return yProps;
        }

        public drawColumns(useAnimation: boolean): ColumnChartDrawInfo {
            var data = this.data;
            debug.assertValue(data, 'data should not be null or undefined');

            this.columnsCenters = null; // invalidate the columnsCenters so that will be calculated again

            var axisOptions: ColumnAxisOptions = {
                columnWidth: 10,//this.categoryLayout.categoryThickness * (1 - CartesianChart.InnerPaddingRatio),
                xScale: this.xProps.scale,
                yScale: this.yProps.scale,
                isScalar: this.categoryLayout.isScalar,
                margin: this.margin,
            };
            var stackedColumnLayout = this.layout = MekkoChartStrategy.getLayout(data, axisOptions);
            var dataLabelSettings = data.labelSettings;
            var labelDataPoints: LabelDataPoint[] = [];
            if (dataLabelSettings && dataLabelSettings.show) {
                labelDataPoints = this.createLabelDataPoints();
            }

            var result: ColumnChartAnimationResult;
            var shapes: D3.UpdateSelection;
            var series = ColumnUtil.drawSeries(data, this.graphicsContext.mainGraphicsContext, axisOptions);
            if (this.animator && useAnimation) {
                result = this.animator.animate({
                    viewModel: data,
                    series: series,
                    layout: stackedColumnLayout,
                    itemCS: MekkoChartStrategy.classes.item,
                    interactivityService: this.interactivityService,
                    mainGraphicsContext: this.graphicsContext.mainGraphicsContext,
                    viewPort: { height: this.height, width: this.width },
                });
                shapes = result.shapes;
            }
            if (!this.animator || !useAnimation || result.failed) {
                shapes = ColumnUtil.drawDefaultShapes(data, series, stackedColumnLayout, MekkoChartStrategy.classes.item, !this.animator, this.interactivityService && this.interactivityService.hasSelection());
            }

            ColumnUtil.applyInteractivity(shapes, this.graphicsContext.onDragStart);

            return {
                shapesSelection: shapes,
                viewport: { height: this.height, width: this.width },
                axisOptions,
                labelDataPoints: labelDataPoints,
            };
        }

        public selectColumn(selectedColumnIndex: number, lastSelectedColumnIndex: number): void {
            ColumnUtil.setChosenColumnOpacity(this.graphicsContext.mainGraphicsContext, MekkoChartStrategy.classes.item.selector, selectedColumnIndex, lastSelectedColumnIndex);
            this.moveHandle(selectedColumnIndex);
        }

        public getClosestColumnIndex(x: number, y: number): number {
            return ColumnUtil.getClosestColumnIndex(x, this.getColumnsCenters());
        }

        /**
         * Get the chart's columns centers (x value).
         */
        private getColumnsCenters(): number[] {
            if (!this.columnsCenters) { // lazy creation
                var categoryWidth: number = this.categoryLayout.categoryThickness * (1 - CartesianChart.InnerPaddingRatio);
                // use the axis scale and first series data to get category centers
                if (this.data.series.length > 0) {
                    var xScaleOffset = 0;
                    if (!this.categoryLayout.isScalar)
                        xScaleOffset = categoryWidth / 2;
                    var firstSeries = this.data.series[0];
                    this.columnsCenters = firstSeries.data.map(d => this.xProps.scale(this.categoryLayout.isScalar ? d.categoryValue : d.categoryIndex) + xScaleOffset);
                }
            }
            return this.columnsCenters;
        }

        private moveHandle(selectedColumnIndex: number) {
            var columnCenters = this.getColumnsCenters();
            var x = columnCenters[selectedColumnIndex];

            if (!this.columnSelectionLineHandle) {
                var handle = this.columnSelectionLineHandle = this.graphicsContext.mainGraphicsContext.append('g');
                handle.append('line')
                    .classed('interactive-hover-line', true)
                    .attr({
                        x1: x,
                        x2: x,
                        y1: 0,
                        y2: this.height,
                    });

                handle.append('circle')
                    .attr({
                        cx: x,
                        cy: this.height,
                        r: '6px',
                    })
                    .classed('drag-handle', true);
            }
            else {
                var handle = this.columnSelectionLineHandle;
                handle.select('line').attr({ x1: x, x2: x });
                handle.select('circle').attr({ cx: x });
            }
        }

        public static getLayout(data: ColumnChartData, axisOptions: ColumnAxisOptions): IColumnLayout {
            var columnWidth = axisOptions.columnWidth;
            var isScalar = axisOptions.isScalar;
            var xScale = axisOptions.xScale;
            var yScale = axisOptions.yScale;
            var scaledY0 = yScale(0);
            var scaledX0 = xScale(0);
            var xScaleOffset = 0;

            if (isScalar) {
                xScaleOffset = columnWidth / 2;
            }

            var widthScale = (d: ColumnChartDataPoint) => {
                var value = AxisHelper.diffScaled(xScale, d.value, 0);
                return value;
            };

            var xS = (d: ColumnChartDataPoint) => {
                var value = scaledX0 + AxisHelper.diffScaled(xScale, d.originalPosition, 0);
                return value;
            };

            return {
                shapeLayout: {
                    width: widthScale,
                    x: xS,
                    y: (d: ColumnChartDataPoint) => scaledY0 + AxisHelper.diffScaled(yScale, d.position, 0),
                    height: (d: ColumnChartDataPoint) => StackedUtil.getSize(yScale, d.valueAbsolute)
                },
                shapeLayoutWithoutHighlights: {
                    width: widthScale,
                    x: xS,
                    y: (d: ColumnChartDataPoint) => scaledY0 + AxisHelper.diffScaled(yScale, d.position, 0),
                    height: (d: ColumnChartDataPoint) => StackedUtil.getSize(yScale, d.originalValueAbsolute)
                },
                zeroShapeLayout: {
                    width: widthScale,
                    x: xS,
                    y: (d: ColumnChartDataPoint) => scaledY0 + AxisHelper.diffScaled(yScale, d.position, 0) + StackedUtil.getSize(yScale, d.valueAbsolute),
                    height: (d: ColumnChartDataPoint) => 0
                },
            };
        }

        private createLabelDataPoints(): LabelDataPoint[] {
            var labelDataPoints: LabelDataPoint[] = [];
            var data = this.data;
            var series = data.series;
            var formattersCache = NewDataLabelUtils.createColumnFormatterCacheManager();
            var shapeLayout = this.layout.shapeLayout;

            for (var currentSeries in series) {
                var labelSettings = currentSeries.labelSettings ? currentSeries.labelSettings : data.labelSettings;
                var axisFormatter: number = NewDataLabelUtils.getDisplayUnitValueFromAxisFormatter(this.yProps.formatter, labelSettings);
                for (var dataPoint in currentSeries.data) {
                    if ((this.interactivityService && this.interactivityService.hasSelection() && !dataPoint.selected) || (data.hasHighlights && !dataPoint.highlight)) {
                        continue;
                    }

                    // Calculate parent rectangle
                    var parentRect: IRect = {
                        left: shapeLayout.x(dataPoint),
                        top: shapeLayout.y(dataPoint),
                        width: shapeLayout.width(dataPoint),
                        height: shapeLayout.height(dataPoint),
                    };

                    // Calculate label text
                    var formatString = "";
                    if (this.graphicsContext.is100Pct) {
                        formatString = NewDataLabelUtils.hundredPercentFormat;
                    }
                    else {
                        formatString = dataPoint.labelFormatString;
                    }
                    var formatter = formattersCache.getOrCreate(formatString, labelSettings, axisFormatter);
                    var text = NewDataLabelUtils.getLabelFormattedText(formatter.format(dataPoint.value));

                    // Calculate text size
                    var properties: TextProperties = {
                        text: text,
                        fontFamily: NewDataLabelUtils.LabelTextProperties.fontFamily,
                        fontSize: NewDataLabelUtils.LabelTextProperties.fontSize,
                        fontWeight: NewDataLabelUtils.LabelTextProperties.fontWeight,
                    };
                    var textWidth = TextMeasurementService.measureSvgTextWidth(properties);
                    var textHeight = TextMeasurementService.estimateSvgTextHeight(properties);

                    labelDataPoints.push({
                        isPreferred: true,
                        text: text,
                        textSize: {
                            width: textWidth,
                            height: textHeight,
                        },
                        outsideFill: labelSettings.labelColor ? labelSettings.labelColor : NewDataLabelUtils.defaultLabelColor,
                        insideFill: labelSettings.labelColor ? labelSettings.labelColor : NewDataLabelUtils.defaultInsideLabelColor,
                        isParentRect: true,
                        parentShape: {
                            rect: parentRect,
                            orientation: dataPoint.value >= 0 ? NewRectOrientation.VerticalBottomBased : NewRectOrientation.VerticalTopBased,
                            validPositions: MekkoChartStrategy.validLabelPositions,
                        },
                        identity: dataPoint.identity,
                    });
                }
            }

            return labelDataPoints;
        }
    }

    var COMBOCHART_DOMAIN_OVERLAP_TRESHOLD_PERCENTAGE = 0.1;

    /** 
     * Renders a data series as a cartestian visual.
     */
    export class MekkoChart implements IVisual {
        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: 'Category',
                    kind: VisualDataRoleKind.Grouping,
                    displayName: data.createDisplayNameGetter('Role_DisplayName_Axis'),
                }, {
                    name: 'Series',
                    kind: VisualDataRoleKind.Grouping,
                    displayName: data.createDisplayNameGetter('Role_DisplayName_Legend'),
                }, {
                    name: 'Y',
                    kind: VisualDataRoleKind.Measure,
                    displayName: data.createDisplayNameGetter('Role_DisplayName_Value'),
                }, {
                    name: 'Width',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Axis width',
                }/*, {
                    name: 'Gradient',
                    kind: VisualDataRoleKind.Measure,
                    displayName: data.createDisplayNameGetter('Role_DisplayName_Gradient'),
                }*/
            ],
            objects: {
                general: {
                    displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        formatString: {
                            type: { formatting: { formatString: true } },
                        },
                    },
                },
                legend: {
                    displayName: data.createDisplayNameGetter('Visual_Legend'),
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                        position: {
                            displayName: data.createDisplayNameGetter('Visual_LegendPosition'),
                            type: { formatting: { legendPosition: true } }
                        },
                        showTitle: {
                            displayName: data.createDisplayNameGetter('Visual_LegendShowTitle'),
                            type: { bool: true }
                        },
                        titleText: {
                            displayName: data.createDisplayNameGetter('Visual_LegendTitleText'),
                            type: { text: true }
                        }
                    }
                },
                categoryAxis: {
                    //displayName: transposeAxes ? data.createDisplayNameGetter('Visual_YAxis') : data.createDisplayNameGetter('Visual_XAxis'),
                    displayName: data.createDisplayNameGetter('Visual_XAxis'),
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                        position: {
                            displayName: data.createDisplayNameGetter('Visual_YAxis_Position'),
                            type: { formatting: { yAxisPosition: true } }
                        },
                        axisScale: {
                            displayName: data.createDisplayNameGetter('Visual_Axis_Scale'),
                            type: { formatting: { axisScale: true } }
                        },
                        /*start: {
                            displayName: data.createDisplayNameGetter('Visual_Axis_Start'),
                            type: { numeric: true }
                        },
                        end: {
                            displayName: data.createDisplayNameGetter('Visual_Axis_End'),
                            type: { numeric: true }
                        },*/
                        axisType: {
                            displayName: data.createDisplayNameGetter('Visual_Axis_Type'),
                            type: { formatting: { axisType: true } }
                        },
                        showAxisTitle: {
                            displayName: data.createDisplayNameGetter('Visual_Axis_Title'),
                            type: { bool: true }
                        },
                        axisStyle: {
                            displayName: data.createDisplayNameGetter('Visual_Axis_Style'),
                            type: { formatting: { axisStyle: true } }
                        },
                        labelColor: {
                            displayName: data.createDisplayNameGetter('Visual_Axis_LabelColor'),
                            type: { fill: { solid: { color: true } } }
                        }
                    }
                },
                valueAxis: {
                    //displayName: transposeAxes ? data.createDisplayNameGetter('Visual_XAxis') : data.createDisplayNameGetter('Visual_YAxis'),
                    displayName: data.createDisplayNameGetter('Visual_YAxis'),
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                        position: {
                            displayName: data.createDisplayNameGetter('Visual_YAxis_Position'),
                            type: { formatting: { yAxisPosition: true } }
                        },
                        axisScale: {
                            displayName: data.createDisplayNameGetter('Visual_Axis_Scale'),
                            type: { formatting: { axisScale: true } }
                        },
                        /*start: {
                            displayName: data.createDisplayNameGetter('Visual_Axis_Start'),
                            type: { numeric: true }
                        },
                        end: {
                            displayName: data.createDisplayNameGetter('Visual_Axis_End'),
                            type: { numeric: true }
                        },*/
                        intersection: {
                            displayName: data.createDisplayNameGetter('Visual_Axis_Intersection'),
                            type: { numeric: true }
                        },
                        showAxisTitle: {
                            displayName: data.createDisplayNameGetter('Visual_Axis_Title'),
                            type: { bool: true }
                        },
                        axisStyle: {
                            displayName: data.createDisplayNameGetter('Visual_Axis_Style'),
                            type: { formatting: { axisStyle: true } }
                        },
                        labelColor: {
                            displayName: data.createDisplayNameGetter('Visual_Axis_LabelColor'),
                            type: { fill: { solid: { color: true } } }
                        }

                    }
                },
                dataPoint: {
                    displayName: data.createDisplayNameGetter('Visual_DataPoint'),
                    properties: {
                        defaultColor: {
                            displayName: data.createDisplayNameGetter('Visual_DefaultColor'),
                            type: { fill: { solid: { color: true } } }
                        },
                        showAllDataPoints: {
                            displayName: data.createDisplayNameGetter('Visual_DataPoint_Show_All'),
                            type: { bool: true }
                        },
                        fill: {
                            displayName: data.createDisplayNameGetter('Visual_Fill'),
                            type: { fill: { solid: { color: true } } }
                        },
                        fillRule: {
                            displayName: data.createDisplayNameGetter('Visual_Gradient'),
                            type: { fillRule: {} },
                            rule: {
                                inputRole: 'Gradient',
                                output: {
                                    property: 'fill',
                                    selector: ['Category'],
                                },
                            },
                        }
                    }
                },
             /*   labels: {
                    displayName: data.createDisplayNameGetter('Visual_DataPointsLabels'),
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                        color: {
                            displayName: data.createDisplayNameGetter('Visual_LabelsFill'),
                            type: { fill: { solid: { color: true } } }
                        },
                        labelDisplayUnits: {
                            displayName: data.createDisplayNameGetter('Visual_DisplayUnits'),
                            type: { formatting: { labelDisplayUnits: true } }
                        },
                        labelPrecision: {
                            displayName: data.createDisplayNameGetter('Visual_Precision'),
                            type: { numeric: true }
                        },
                    },
                },*/
            },
            dataViewMappings: [{
                conditions: [
                    { 'Category': { min: 0, max: 1 }, 'Series': { min: 0, max: 1 }, 'Y': { min: 0, max: 1 }, 'Width': { max: 0 } },
                    { 'Category': { min: 1, max: 1 }, 'Series': { min: 1, max: 1 }, 'Y': { min: 1, max: 1 }, 'Width': { max: 1 } },
                ],
                categorical: {
                    categories: {
                        for: { in: 'Category' },
                        dataReductionAlgorithm: { top: {} }
                    },
                    values: {
                        group: {
                            by: 'Series',
                            select: [{ for: { in: 'Y' } }, { bind: { to: 'Width' } }],
                            dataReductionAlgorithm: { top: {} }
                        },
                        select: [
                            { bind: { to: 'Width' } },
                        ]
                    },
                    rowCount: { preferred: { min: 2 }, supported: { min: 0 } }
                },
            }],
            supportsHighlight: true,
            sorting: {
                default: {},
            },
            drilldown: {
                roles: ['Category']
            },
        };

        public static MinOrdinalRectThickness = 20;
        public static MinScalarRectThickness = 2;
        public static OuterPaddingRatio = 0.4;
        public static InnerPaddingRatio = 0.2;
        public static TickLabelPadding = 2;

        private static ClassName = 'cartesianChart';
        private static AxisGraphicsContextClassName = 'axisGraphicsContext';
        private static MaxMarginFactor = 0.25;
        private static MinBottomMargin = 25;
        private static TopMargin = 8;
        private static LeftPadding = 10;
        private static RightPadding = 15;
        private static BottomPadding = 12;
        //private static PlayAxisBottomMargin = 75;
        private static YAxisLabelPadding = 20;
        private static XAxisLabelPadding = 18;
        private static TickPaddingY = 10;
        private static TickPaddingRotatedX = 5;
        private static FontSize = 11;
        private static FontSizeString = jsCommon.PixelConverter.toString(MekkoChart.FontSize);
        private static TextProperties: TextProperties = {
            fontFamily: 'wf_segoe-ui_normal',
            fontSize: MekkoChart.FontSizeString,
        };

        private axisGraphicsContext: D3.Selection;
        private xAxisGraphicsContext: D3.Selection;
        private y1AxisGraphicsContext: D3.Selection;
        private y2AxisGraphicsContext: D3.Selection;
        private element: JQuery;
        private svg: D3.Selection;
        private clearCatcher: D3.Selection;
        private margin: IMargin;
        private type: MekkoChartType;
        private hostServices: IVisualHostServices;
        private layers: ICartesianVisual[];
        private legend: ILegend;
        private legendMargins: IViewport;
        private layerLegendData: LegendData;
        private hasSetData: boolean;
        private visualInitOptions: VisualInitOptions;
        private legendObjectProperties: DataViewObject;
        private categoryAxisProperties: DataViewObject;
        private valueAxisProperties: DataViewObject;
        private cartesianSmallViewPortProperties: CartesianSmallViewPortProperties;
        private interactivityService: IInteractivityService;
        private behavior: IInteractiveBehavior;
        private y2AxisExists: boolean;
        private categoryAxisHasUnitType: boolean;
        private valueAxisHasUnitType: boolean;
        private hasCategoryAxis: boolean;
        private yAxisIsCategorical: boolean;
        private secValueAxisHasUnitType: boolean;
        private axes: CartesianAxisProperties;
        private yAxisOrientation: string;
        private bottomMarginLimit: number;
        private leftRightMarginLimit: number;
        private sharedColorPalette: SharedColorPalette;
        private seriesLabelFormattingEnabled: boolean;

        public animator: IGenericAnimator;

        // Scrollbar related
        private isScrollable: boolean;
        private scrollY: boolean;
        private scrollX: boolean;
        private isXScrollBarVisible: boolean;
        private isYScrollBarVisible: boolean;
        private svgScrollable: D3.Selection;
        private axisGraphicsContextScrollable: D3.Selection;
        private labelGraphicsContextScrollable: D3.Selection;
        private brushGraphicsContext: D3.Selection;
        private brushContext: D3.Selection;
        private brush: D3.Svg.Brush;
        private static ScrollBarWidth = 10;
        private static fillOpacity = 0.125;
        private brushMinExtent: number;
        private scrollScale: D3.Scale.OrdinalScale;

        // TODO: Remove onDataChanged & onResizing once all visuals have implemented update.
        private dataViews: DataView[];
        private currentViewport: IViewport;
/*
        private static getAxisVisibility(type: MekkoChartType): AxisLinesVisibility {
            return AxisLinesVisibility.ShowLinesOnBothAxis;
        }
*/
        
        constructor(options: MekkoConstructorOptions) {
            this.isScrollable = false;
            if (options) {
                this.type = options.chartType;
                this.seriesLabelFormattingEnabled = options.seriesLabelFormattingEnabled;
                if (options.isScrollable)
                    this.isScrollable = options.isScrollable;
                this.animator = options.animator;
                if (options.cartesianSmallViewPortProperties) {
                    this.cartesianSmallViewPortProperties = options.cartesianSmallViewPortProperties;
                }

                if (options.behavior) {
                    this.behavior = options.behavior;
                }
            }
        }

        public init(options: VisualInitOptions) {
            this.visualInitOptions = options;
            this.layers = [];

            var element = this.element = options.element;
            var viewport = this.currentViewport = options.viewport;
            this.hostServices = options.host;
            this.brush = d3.svg.brush();
            element.addClass(MekkoChart.ClassName);
            this.margin = {
                top: 1,
                right: 1,
                bottom: 1,
                left: 1
            };
            this.yAxisOrientation = yAxisPosition.left;
            this.adjustMargins(viewport);

            this.sharedColorPalette = new SharedColorPalette(options.style.colorPalette.dataColors);

            var axisLinesVisibility = AxisLinesVisibility.ShowLinesOnBothAxis;
            //MekkoChart.getAxisVisibility(this.type);

            var showLinesOnX = this.scrollY = EnumExtensions.hasFlag(axisLinesVisibility, AxisLinesVisibility.ShowLinesOnBothAxis) ||
                EnumExtensions.hasFlag(axisLinesVisibility, AxisLinesVisibility.ShowLinesOnXAxis);

            var showLinesOnY = this.scrollX = EnumExtensions.hasFlag(axisLinesVisibility, AxisLinesVisibility.ShowLinesOnBothAxis) ||
                EnumExtensions.hasFlag(axisLinesVisibility, AxisLinesVisibility.ShowLinesOnYAxis);

            /*
                The layout of the visual would look like :
                <svg>
                    <g>
                        <nonscrollable axis/>
                    </g>
                    <svgScrollable>
                        <g>
                            <scrollable axis/>
                        </g>
                    </svgScrollable>
                    <g xbrush/>
                </svg>                    

            */
            var svg = this.svg = d3.select(element.get(0)).append('svg');
            svg.style('position', 'absolute');

            var axisGraphicsContext = this.axisGraphicsContext = svg.append('g')
                .classed(MekkoChart.AxisGraphicsContextClassName, true);

            this.svgScrollable = svg.append('svg')
                .classed('svgScrollable', true)
                .style('overflow', 'hidden');

            var axisGraphicsContextScrollable = this.axisGraphicsContextScrollable = this.svgScrollable.append('g')
                .classed(MekkoChart.AxisGraphicsContextClassName, true);

            this.labelGraphicsContextScrollable = this.svgScrollable.append('g')
                .classed(NewDataLabelUtils.labelGraphicsContextClass.class, true);

            if (this.behavior)
                this.clearCatcher = appendClearCatcher(this.axisGraphicsContextScrollable);

            var axisGroup = showLinesOnX ? axisGraphicsContextScrollable : axisGraphicsContext;

            this.xAxisGraphicsContext = showLinesOnX ? axisGraphicsContext.append('g').attr('class', 'x axis') : axisGraphicsContextScrollable.append('g').attr('class', 'x axis');
            this.y1AxisGraphicsContext = axisGroup.append('g').attr('class', 'y axis');
            this.y2AxisGraphicsContext = axisGroup.append('g').attr('class', 'y axis');

            this.xAxisGraphicsContext.classed('showLinesOnAxis', showLinesOnX);
            this.y1AxisGraphicsContext.classed('showLinesOnAxis', showLinesOnY);
            this.y2AxisGraphicsContext.classed('showLinesOnAxis', showLinesOnY);

            this.xAxisGraphicsContext.classed('hideLinesOnAxis', !showLinesOnX);
            this.y1AxisGraphicsContext.classed('hideLinesOnAxis', !showLinesOnY);
            this.y2AxisGraphicsContext.classed('hideLinesOnAxis', !showLinesOnY);

            if (this.behavior) {
                this.interactivityService = createInteractivityService(this.hostServices);
            }
            this.legend = createLegend(
                element,
                options.interactivity && options.interactivity.isInteractiveLegend,
                this.interactivityService,
                this.isScrollable);
        }

        private renderAxesLabels(options: AxisRenderingOptions): void {
            debug.assertValue(options, 'options');
            debug.assertValue(options.viewport, 'options.viewport');
            debug.assertValue(options.axisLabels, 'options.axisLabels');

            this.axisGraphicsContext.selectAll('.xAxisLabel').remove();
            this.axisGraphicsContext.selectAll('.yAxisLabel').remove();

            var margin = this.margin;
            var width = options.viewport.width - (margin.left + margin.right);
            var height = options.viewport.height;
            var fontSize = MekkoChart.FontSize;
            var heightOffset = fontSize;
            
            var showOnRight = this.yAxisOrientation === yAxisPosition.right;

            if (!options.hideXAxisTitle) {
                var xAxisLabel = this.axisGraphicsContext.append("text")
                    .style("text-anchor", "middle")
                    .text(options.axisLabels.x)
                    .call((text: D3.Selection) => {
                        text.each(function() {
                            var text = d3.select(this);
                            text.attr({
                                "class": "xAxisLabel",
                                "transform": SVGUtil.translate(width / 2, height - heightOffset)
                            });
                        });
                    });

                xAxisLabel.style("fill", options.xLabelColor ? options.xLabelColor.solid.color : null);

                xAxisLabel.call(AxisHelper.LabelLayoutStrategy.clip,
                    width,
                    TextMeasurementService.svgEllipsis);
            }

            if (!options.hideYAxisTitle) {
                var yAxisLabel = this.axisGraphicsContext.append("text")
                    .style("text-anchor", "middle")
                    .text(options.axisLabels.y)
                    .call((text: D3.Selection) => {
                        text.each(function() {
                            var text = d3.select(this);
                            text.attr({
                                "class": "yAxisLabel",
                                "transform": "rotate(-90)",
                                "y": showOnRight ? width + margin.right - fontSize : -margin.left,
                                "x": -((height - margin.top - options.legendMargin) / 2),
                                "dy": "1em"
                            });
                        });
                    });

                yAxisLabel.style("fill", options.yLabelColor ? options.yLabelColor.solid.color : null);

                yAxisLabel.call(AxisHelper.LabelLayoutStrategy.clip,
                    height - (margin.bottom + margin.top),
                    TextMeasurementService.svgEllipsis);
            }

            if (!options.hideY2AxisTitle && options.axisLabels.y2) {
                var y2AxisLabel = this.axisGraphicsContext.append("text")
                    .style("text-anchor", "middle")
                    .text(options.axisLabels.y2)
                    .call((text: D3.Selection) => {
                        text.each(function() {
                            var text = d3.select(this);
                            text.attr({
                                "class": "yAxisLabel",
                                "transform": "rotate(-90)",
                                "y": showOnRight ? -margin.left : width + margin.right - fontSize,
                                "x": -((height - margin.top - options.legendMargin) / 2),
                                "dy": "1em"
                            });
                        });
                    });

                y2AxisLabel.style("fill", options.y2LabelColor ? options.y2LabelColor.solid.color : null);

                y2AxisLabel.call(AxisHelper.LabelLayoutStrategy.clip,
                    height - (margin.bottom + margin.top),
                    TextMeasurementService.svgEllipsis);
            }
        }

        private adjustMargins(viewport: IViewport): void {
            var margin = this.margin;

            var width = viewport.width - (margin.left + margin.right);
            var height = viewport.height - (margin.top + margin.bottom);

            // Adjust margins if ticks are not going to be shown on either axis
            var xAxis = this.element.find('.x.axis');

            if (AxisHelper.getRecommendedNumberOfTicksForXAxis(width) === 0
                && AxisHelper.getRecommendedNumberOfTicksForYAxis(height) === 0) {
                this.margin = {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                };
                xAxis.hide();
            } else {
                xAxis.show();
            }
        }

        // Margin convention: http://bl.ocks.org/mbostock/3019563
        private translateAxes(viewport: IViewport): void {
            this.adjustMargins(viewport);
            var margin = this.margin;

            var width = viewport.width - (margin.left + margin.right);
            var height = viewport.height - (margin.top + margin.bottom);

            var showY1OnRight = this.yAxisOrientation === yAxisPosition.right;

            this.xAxisGraphicsContext
                .attr('transform', SVGUtil.translate(0, height));

            this.y1AxisGraphicsContext
                .attr('transform', SVGUtil.translate(showY1OnRight ? width : 0, 0));

            this.y2AxisGraphicsContext
                .attr('transform', SVGUtil.translate(showY1OnRight ? 0 : width, 0));

            this.svg.attr({
                'width': viewport.width,
                'height': viewport.height
            });

            this.svgScrollable.attr({
                'width': viewport.width,
                'height': viewport.height
            });

            this.svgScrollable.attr({
                'x': 0
            });

            this.axisGraphicsContext.attr('transform', SVGUtil.translate(margin.left, margin.top));
            this.axisGraphicsContextScrollable.attr('transform', SVGUtil.translate(margin.left, margin.top));
            this.labelGraphicsContextScrollable.attr('transform', SVGUtil.translate(margin.left, margin.top));

            if (this.isXScrollBarVisible) {
                this.svgScrollable.attr({
                    'x': this.margin.left
                });
                this.axisGraphicsContextScrollable.attr('transform', SVGUtil.translate(0, margin.top));
                this.labelGraphicsContextScrollable.attr('transform', SVGUtil.translate(0, margin.top));
                this.svgScrollable.attr('width', width);
                this.svg.attr('width', viewport.width)
                    .attr('height', viewport.height + MekkoChart.ScrollBarWidth);
            }
            else if (this.isYScrollBarVisible) {
                this.svgScrollable.attr('height', height + margin.top);
                this.svg.attr('width', viewport.width + MekkoChart.ScrollBarWidth)
                    .attr('height', viewport.height);
            }
        }

        public static getIsScalar(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, type: ValueType): boolean {
            var axisTypeValue = DataViewObjects.getValue(objects, propertyId);

            if (!objects || axisTypeValue === undefined) {
                // If we don't have anything set (Auto), show charts as Scalar if the category type is numeric or time. 
                // If we have the property, it will override the type.
                return !AxisHelper.isOrdinal(type);
            }

            // also checking type here to be in sync with AxisHelper, which ignores scalar if the type is non-numeric.
            return (axisTypeValue === axisType.scalar) && !AxisHelper.isOrdinal(type);
        }

        private populateObjectProperties(dataViews: DataView[]) {
            if (dataViews && dataViews.length > 0) {
                var dataViewMetadata = dataViews[0].metadata;

                if (dataViewMetadata) {
                    this.legendObjectProperties = DataViewObjects.getObject(dataViewMetadata.objects, 'legend', {});
                }
                else {
                    this.legendObjectProperties = {};
                }
                this.categoryAxisProperties = CartesianHelper.getCategoryAxisProperties(dataViewMetadata);
                this.valueAxisProperties = CartesianHelper.getValueAxisProperties(dataViewMetadata);
                var axisPosition = this.valueAxisProperties['position'];
                this.yAxisOrientation = axisPosition ? axisPosition.toString() : yAxisPosition.left;
            }
        }

        public update(options: VisualUpdateOptions) {
            debug.assertValue(options, 'options');

            var dataViews = this.dataViews = options.dataViews;
            this.currentViewport = options.viewport;
            
            //console.log(dataViews);
            
            if (!dataViews) return;

            if (this.layers.length === 0) {
                // Lazily instantiate the chart layers on the first data load.
                this.layers = this.createAndInitLayers(dataViews);

                debug.assert(this.layers.length > 0, 'createAndInitLayers should update the layers.');
            }
            var layers = this.layers;

            if (dataViews && dataViews.length > 0) {
                var warnings = getInvalidValueWarnings(
                    dataViews,
                    false /*supportsNaN*/,
                    false /*supportsNegativeInfinity*/,
                    false /*supportsPositiveInfinity*/);

                if (warnings && warnings.length > 0)
                    this.hostServices.setWarnings(warnings);

                this.populateObjectProperties(dataViews);
            }

            this.sharedColorPalette.clearPreferredScale();
            for (var i = 0, len = layers.length; i < len; i++) {
                layers[i].setData(getLayerData(dataViews, i, len));

                if (len > 1)
                    this.sharedColorPalette.rotateScale();
            }

            // Note: interactive legend shouldn't be rendered explicitly here
            // The interactive legend is being rendered in the render method of ICartesianVisual
            if (!(this.visualInitOptions.interactivity && this.visualInitOptions.interactivity.isInteractiveLegend)) {
                this.renderLegend();
            }

            this.render(!this.hasSetData || options.suppressAnimations);

            this.hasSetData = this.hasSetData || (dataViews && dataViews.length > 0);
        }

        // TODO: Remove onDataChanged & onResizing once all visuals have implemented update.
        /*
        public onDataChanged(options: VisualDataChangedOptions): void {
            this.update({
                dataViews: options.dataViews,
                suppressAnimations: options.suppressAnimations,
                viewport: this.currentViewport
            });
        }

        // TODO: Remove onDataChanged & onResizing once all visuals have implemented update.
        public onResizing(viewport: IViewport): void {
            if (this.currentViewport && (this.currentViewport.height === viewport.height && this.currentViewport.width === viewport.width)) {
                return;
            }

            this.update({
                dataViews: this.dataViews,
                suppressAnimations: true,
                viewport: viewport
            });
        }
*/
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration = new ObjectEnumerationBuilder();
            var layersLength = this.layers ? this.layers.length : 0;

            if (options.objectName === 'legend') {
                if (!this.shouldShowLegendCard())
                    return;
                var show = DataViewObject.getValue(this.legendObjectProperties, legendProps.show, this.legend.isVisible());
                var showTitle = DataViewObject.getValue(this.legendObjectProperties, legendProps.showTitle, true);
                var titleText = DataViewObject.getValue(this.legendObjectProperties, legendProps.titleText, this.layerLegendData ? this.layerLegendData.title : '');

                enumeration.pushInstance({
                    selector: null,
                    properties: {
                        show: show,
                        position: LegendPosition[this.legend.getOrientation()],
                        showTitle: showTitle,
                        titleText: titleText
                    },
                    objectName: options.objectName
                });
            }
            else if (options.objectName === 'categoryAxis' && this.hasCategoryAxis) {
                this.getCategoryAxisValues(enumeration);
            }
            else if (options.objectName === 'valueAxis') {
                this.getValueAxisValues(enumeration);
            }

            for (var i = 0, len = layersLength; i < len; i++) {
                var layer = this.layers[i];
                if (layer.enumerateObjectInstances) {
                    layer.enumerateObjectInstances(enumeration, options);
                }
            }

            return enumeration.complete();
        }

        private shouldShowLegendCard(): boolean {
            var layers = this.layers;
            var dataViews = this.dataViews;

            if (layers && dataViews) {
                var layersLength = layers.length;
                var layersWithValuesCtr = 0;

                for (var i = 0; i < layersLength; i++) {
                    if (layers[i].hasLegend()) {
                        return true;
                    }

                    // if there are at least two layers with values legend card should be shown (even if each of the individual layers don't have legend)
                    var dataView = dataViews[i];
                    if (dataView && dataView.categorical && dataView.categorical.values && dataView.categorical.values.length > 0) {
                        layersWithValuesCtr++;
                        if (layersWithValuesCtr > 1) {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        public scrollTo(position: number): void {
            debug.assert(this.isXScrollBarVisible || this.isYScrollBarVisible, 'scrolling is not available');
            debug.assertValue(this.scrollScale, 'scrollScale');

            var extent = this.brush.extent();
            var extentLength = extent[1] - extent[0];
            extent[0] = this.scrollScale(position);
            extent[1] = extent[0] + extentLength;
            this.brush.extent(extent);

            var scrollSpaceLength = this.scrollScale.rangeExtent()[1];
            this.setMinBrush(scrollSpaceLength, this.brushMinExtent);

            var triggerBrush = this.brush.on('brush');
            triggerBrush(null, 0);  // We don't use the data or index.
        }

        private getCategoryAxisValues(enumeration: ObjectEnumerationBuilder): void {
            var supportedType = axisType.both;
            var isScalar = false;
            var logPossible = !!this.axes.x.isLogScaleAllowed;
            var scaleOptions = [axisScale.log, axisScale.linear];//until options can be update in propPane, show all options

            if (this.layers && this.layers[0].getSupportedCategoryAxisType) {
                supportedType = this.layers[0].getSupportedCategoryAxisType();
                if (supportedType === axisType.scalar) {
                    isScalar = true;
                }
                else {
                    isScalar = CartesianHelper.isScalar(supportedType === axisType.both, this.categoryAxisProperties);
                }
            }

            if (!isScalar) {
                if (this.categoryAxisProperties) {
                    this.categoryAxisProperties['start'] = null;
                    this.categoryAxisProperties['end'] = null;
                }
            }

            var instance: VisualObjectInstance = {
                selector: null,
                properties: {},
                objectName: 'categoryAxis',
                validValues: {
                    axisScale: scaleOptions
                }
            };

            instance.properties['show'] = this.categoryAxisProperties && this.categoryAxisProperties['show'] != null ? this.categoryAxisProperties['show'] : true;
            if (this.yAxisIsCategorical)//in case of e.g. barChart
                instance.properties['position'] = this.valueAxisProperties && this.valueAxisProperties['position'] != null ? this.valueAxisProperties['position'] : yAxisPosition.left;
            if (supportedType === axisType.both) {
                instance.properties['axisType'] = isScalar ? axisType.scalar : axisType.categorical;
            }
            if (isScalar) {
                instance.properties['axisScale'] = (this.categoryAxisProperties && this.categoryAxisProperties['axisScale'] != null && logPossible) ? this.categoryAxisProperties['axisScale'] : axisScale.linear;
                instance.properties['start'] = this.categoryAxisProperties ? this.categoryAxisProperties['start'] : null;
                instance.properties['end'] = this.categoryAxisProperties ? this.categoryAxisProperties['end'] : null;
            }
            instance.properties['showAxisTitle'] = this.categoryAxisProperties && this.categoryAxisProperties['showAxisTitle'] != null ? this.categoryAxisProperties['showAxisTitle'] : false;

            enumeration
                .pushInstance(instance)
                .pushInstance({
                    selector: null,
                    properties: {
                        axisStyle: this.categoryAxisProperties && this.categoryAxisProperties['axisStyle'] ? this.categoryAxisProperties['axisStyle'] : axisStyle.showTitleOnly,
                        labelColor: this.categoryAxisProperties ? this.categoryAxisProperties['labelColor'] : null
                    },
                    objectName: 'categoryAxis',
                    validValues: {
                        axisStyle: this.categoryAxisHasUnitType ? [axisStyle.showTitleOnly, axisStyle.showUnitOnly, axisStyle.showBoth] : [axisStyle.showTitleOnly]
                    }
                });
        }

        //todo: wrap all these object getters and other related stuff into an interface
        private getValueAxisValues(enumeration: ObjectEnumerationBuilder): void {
            var scaleOptions = [axisScale.log, axisScale.linear];  //until options can be update in propPane, show all options
            var logPossible = !!this.axes.y1.isLogScaleAllowed;
            var secLogPossible = this.axes.y2 != null && this.axes.y2.isLogScaleAllowed;

            var instance: VisualObjectInstance = {
                selector: null,
                properties: {},
                objectName: 'valueAxis',
                validValues: {
                    axisScale: scaleOptions,
                    secAxisScale: scaleOptions
                }
            };

            instance.properties['show'] = this.valueAxisProperties && this.valueAxisProperties['show'] != null ? this.valueAxisProperties['show'] : true;

            if (!this.yAxisIsCategorical) {
                instance.properties['position'] = this.valueAxisProperties && this.valueAxisProperties['position'] != null ? this.valueAxisProperties['position'] : yAxisPosition.left;
            }
            instance.properties['axisScale'] = (this.valueAxisProperties && this.valueAxisProperties['axisScale'] != null && logPossible) ? this.valueAxisProperties['axisScale'] : axisScale.linear;
            instance.properties['start'] = this.valueAxisProperties ? this.valueAxisProperties['start'] : null;
            instance.properties['end'] = this.valueAxisProperties ? this.valueAxisProperties['end'] : null;
            instance.properties['showAxisTitle'] = this.valueAxisProperties && this.valueAxisProperties['showAxisTitle'] != null ? this.valueAxisProperties['showAxisTitle'] : false;

            enumeration
                .pushInstance(instance)
                .pushInstance({
                    selector: null,
                    properties: {
                        axisStyle: this.valueAxisProperties && this.valueAxisProperties['axisStyle'] != null ? this.valueAxisProperties['axisStyle'] : axisStyle.showTitleOnly,
                        labelColor: this.valueAxisProperties ? this.valueAxisProperties['labelColor'] : null
                    },
                    objectName: 'valueAxis',
                    validValues: {
                        axisStyle: this.valueAxisHasUnitType ? [axisStyle.showTitleOnly, axisStyle.showUnitOnly, axisStyle.showBoth] : [axisStyle.showTitleOnly]
                    },
                });

            if (this.layers.length === 2) {
                instance.properties['secShow'] = this.valueAxisProperties && this.valueAxisProperties['secShow'] != null ? this.valueAxisProperties['secShow'] : this.y2AxisExists;
                if (instance.properties['secShow']) {
                    instance.properties['axisLabel'] = '';//this.layers[0].getVisualType();//I will keep or remove this, depending on the decision made
                }
            }

            if (this.y2AxisExists && instance.properties['secShow']) {
                enumeration.pushContainer({
                    displayName: data.createDisplayNameGetter('Visual_YAxis_ShowSecondary'),
                    expander: comboChartProps.valueAxis.secShow,
                });

                var secInstance: VisualObjectInstance = {
                    selector: null,
                    properties: {},
                    objectName: 'valueAxis'
                };
                secInstance.properties['secAxisLabel'] = ''; //this.layers[1].getVisualType(); //I will keep or remove this, depending on the decision made                        
                secInstance.properties['secPosition'] = this.valueAxisProperties && this.valueAxisProperties['secPosition'] != null ? this.valueAxisProperties['secPosition'] : yAxisPosition.right;
                secInstance.properties['secAxisScale'] = this.valueAxisProperties && this.valueAxisProperties['secAxisScale'] != null && secLogPossible ? this.valueAxisProperties['secAxisScale'] : axisScale.linear;
                secInstance.properties['secStart'] = this.valueAxisProperties ? this.valueAxisProperties['secStart'] : null;
                secInstance.properties['secEnd'] = this.valueAxisProperties ? this.valueAxisProperties['secEnd'] : null;
                secInstance.properties['secShowAxisTitle'] = this.valueAxisProperties && this.valueAxisProperties['secShowAxisTitle'] != null ? this.valueAxisProperties['secShowAxisTitle'] : false;

                enumeration
                    .pushInstance(secInstance)
                    .pushInstance({
                        selector: null,
                        properties: {
                            secAxisStyle: this.valueAxisProperties && this.valueAxisProperties['secAxisStyle'] ? this.valueAxisProperties['secAxisStyle'] : axisStyle.showTitleOnly,
                            labelColor: this.valueAxisProperties ? this.valueAxisProperties['secLabelColor'] : null
                        },
                        objectName: 'valueAxis',
                        validValues: {
                            secAxisStyle: this.secValueAxisHasUnitType ? [axisStyle.showTitleOnly, axisStyle.showUnitOnly, axisStyle.showBoth] : [axisStyle.showTitleOnly]
                        },
                    });

                enumeration.popContainer();
            }
        }

        public onClearSelection(): void {
            if (this.hasSetData) {
                for (var i = 0, len = this.layers.length; i < len; i++) {
                    var layer = this.layers[i];
                    layer.onClearSelection();
                    layer.render(true /* suppressAnimations */);
                }
            }
        }

        private createAndInitLayers(dataViews: DataView[]): ICartesianVisual[] {
            var objects: DataViewObjects;
            if (dataViews && dataViews.length > 0) {
                var dataViewMetadata = dataViews[0].metadata;
                if (dataViewMetadata)
                    objects = dataViewMetadata.objects;
            }
         
            // Create the layers
            var layers = createLayers(this.type, objects, this.interactivityService, this.animator, this.isScrollable, this.seriesLabelFormattingEnabled);

            // Initialize the layers
            var cartesianOptions = <CartesianVisualInitOptions>Prototype.inherit(this.visualInitOptions);
            cartesianOptions.svg = this.axisGraphicsContextScrollable;
            cartesianOptions.cartesianHost = {
                updateLegend: data => this.legend.drawLegend(data, this.currentViewport),
                getSharedColors: () => this.sharedColorPalette,
            };

            for (var i = 0, len = layers.length; i < len; i++)
                layers[i].init(cartesianOptions);

            return layers;
        }

        private renderLegend(): void {
            var layers = this.layers;
            var legendData: LegendData = { title: "", dataPoints: [] };

            for (var i = 0, len = layers.length; i < len; i++) {
                this.layerLegendData = layers[i].calculateLegend();
                if (this.layerLegendData) {
                    legendData.title = i === 0 ? this.layerLegendData.title || ""
                        : legendData.title;
                    legendData.dataPoints = legendData.dataPoints.concat(this.layerLegendData.dataPoints || []);
                    if (this.layerLegendData.grouped) {
                        legendData.grouped = true;
                    }
                }
            }

            var legendProperties = this.legendObjectProperties;

            if (legendProperties) {
                LegendData.update(legendData, legendProperties);
                var position = <string>legendProperties[legendProps.position];

                if (position)
                    this.legend.changeOrientation(LegendPosition[position]);
            }
            else {
                this.legend.changeOrientation(LegendPosition.Top);
            }

            if ((legendData.dataPoints.length === 1 && !legendData.grouped) || this.hideLegends()) {
                legendData.dataPoints = [];
            }

            this.legend.drawLegend(legendData, this.currentViewport);
        }

        private hideLegends(): boolean {
            if (this.cartesianSmallViewPortProperties) {
                if (this.cartesianSmallViewPortProperties.hideLegendOnSmallViewPort && (this.currentViewport.height < this.cartesianSmallViewPortProperties.MinHeightLegendVisible)) {
                    return true;
                }
            }
            return false;
        }

        private addUnitTypeToAxisLabel(axes: CartesianAxisProperties): void {
            var unitType = MekkoChart.getUnitType(axes, (axis: CartesianAxisProperties): IAxisProperties => axis.x);
            if (axes.x.isCategoryAxis) {
                this.categoryAxisHasUnitType = unitType !== null;
            }
            else {
                this.valueAxisHasUnitType = unitType !== null;
            }

            if (axes.x.axisLabel && unitType) {
                if (axes.x.isCategoryAxis) {
                    axes.x.axisLabel = AxisHelper.createAxisLabel(this.categoryAxisProperties, axes.x.axisLabel, unitType);
                }
                else {
                    axes.x.axisLabel = AxisHelper.createAxisLabel(this.valueAxisProperties, axes.x.axisLabel, unitType);
                }
            }

            unitType = MekkoChart.getUnitType(axes, (axis: CartesianAxisProperties): IAxisProperties => axis.y1);

            if (!axes.y1.isCategoryAxis) {
                this.valueAxisHasUnitType = unitType !== null;
            }
            else {
                this.categoryAxisHasUnitType = unitType !== null;
            }

            if (axes.y1.axisLabel && unitType) {
                if (!axes.y1.isCategoryAxis) {
                    axes.y1.axisLabel = AxisHelper.createAxisLabel(this.valueAxisProperties, axes.y1.axisLabel, unitType);
                }
                else {
                    axes.y1.axisLabel = AxisHelper.createAxisLabel(this.categoryAxisProperties, axes.y1.axisLabel, unitType);
                }
            }

            if (axes.y2) {
                var unitType = MekkoChart.getUnitType(axes, (axis: CartesianAxisProperties): IAxisProperties => axis.y2);
                this.secValueAxisHasUnitType = unitType !== null;
                if (axes.y2.axisLabel && unitType) {
                    if (this.valueAxisProperties && this.valueAxisProperties['secAxisStyle']) {
                        if (this.valueAxisProperties['secAxisStyle'] === axisStyle.showBoth) {
                            axes.y2.axisLabel = axes.y2.axisLabel + ' (' + unitType + ')';
                        }
                        else if (this.valueAxisProperties['secAxisStyle'] === axisStyle.showUnitOnly) {
                            axes.y2.axisLabel = unitType;
                        }
                    }
                }
            }
        }

        private shouldRenderSecondaryAxis(axisProperties: IAxisProperties): boolean {
            if (!axisProperties) {
                return false;
            }
            if (!this.valueAxisProperties || this.valueAxisProperties["secShow"] == null || this.valueAxisProperties["secShow"]) {
                return axisProperties.values && axisProperties.values.length > 0;
            }

            return false;
        }

        private shouldRenderAxis(axisProperties: IAxisProperties, propertyName: string = "show"): boolean {
            if (!axisProperties) {
                return false;
            }
            else if (axisProperties.isCategoryAxis && (!this.categoryAxisProperties || this.categoryAxisProperties[propertyName] == null || this.categoryAxisProperties[propertyName])) {
                return axisProperties.values && axisProperties.values.length > 0;
            }
            else if (!axisProperties.isCategoryAxis && (!this.valueAxisProperties || this.valueAxisProperties[propertyName] == null || this.valueAxisProperties[propertyName])) {
                return axisProperties.values && axisProperties.values.length > 0;
            }

            return false;
        }

        private render(suppressAnimations: boolean): void {
            var legendMargins = this.legendMargins = this.legend.getMargins();
            var viewport: IViewport = {
                height: this.currentViewport.height - legendMargins.height,
                width: this.currentViewport.width - legendMargins.width
            };

            var maxMarginFactor = this.getMaxMarginFactor();
            var leftRightMarginLimit = this.leftRightMarginLimit = viewport.width * maxMarginFactor;
            var bottomMarginLimit = this.bottomMarginLimit = Math.max(MekkoChart.MinBottomMargin, Math.ceil(viewport.height * maxMarginFactor));

            var margin = this.margin;
            // reset defaults
            margin.top = MekkoChart.TopMargin;
            margin.bottom = MekkoChart.MinBottomMargin;
            margin.right = 0;

            var axes = this.axes = calculateAxes(this.layers, viewport, margin, this.categoryAxisProperties, this.valueAxisProperties, MekkoChart.TextProperties, this.isXScrollBarVisible || this.isYScrollBarVisible, null);

            this.y2AxisExists = axes.y2 != null;
            this.yAxisIsCategorical = axes.y1.isCategoryAxis;
            this.hasCategoryAxis = this.yAxisIsCategorical ? axes.y1 && axes.y1.values.length > 0 : axes.x && axes.x.values.length > 0;

            var renderXAxis = this.shouldRenderAxis(axes.x);
            var renderY1Axis = this.shouldRenderAxis(axes.y1);
            var renderY2Axis = this.shouldRenderSecondaryAxis(axes.y2);

            var width = viewport.width - (margin.left + margin.right);
            var isScalar = false;
            var mainAxisScale;
            var preferredViewport: IViewport;
            this.isXScrollBarVisible = false;
            this.isYScrollBarVisible = false;

            var yAxisOrientation = this.yAxisOrientation;
            var showY1OnRight = yAxisOrientation === yAxisPosition.right;

            if (this.layers) {
                if (this.layers[0].getVisualCategoryAxisIsScalar)
                    isScalar = this.layers[0].getVisualCategoryAxisIsScalar();

                if (!isScalar && this.isScrollable && this.layers[0].getPreferredPlotArea) {
                    var categoryThickness = this.scrollX ? axes.x.categoryThickness : axes.y1.categoryThickness;
                    var categoryCount = this.scrollX ? axes.x.values.length : axes.y1.values.length;
                    preferredViewport = this.layers[0].getPreferredPlotArea(isScalar, categoryCount, categoryThickness);
                    if (this.scrollX && preferredViewport && preferredViewport.width > viewport.width) {
                        this.isXScrollBarVisible = true;
                        viewport.height -= MekkoChart.ScrollBarWidth;
                    }

                    if (this.scrollY && preferredViewport && preferredViewport.height > viewport.height) {
                        this.isYScrollBarVisible = true;
                        viewport.width -= MekkoChart.ScrollBarWidth;
                        width = viewport.width - (margin.left + margin.right);
                    }
                }
            }

            // Only create the g tag where there is a scrollbar
            if (this.isXScrollBarVisible || this.isYScrollBarVisible) {
                if (!this.brushGraphicsContext) {
                    this.brushGraphicsContext = this.svg.append("g")
                        .classed('x brush', true);
                }
            }
            else {
                // clear any existing brush if no scrollbar is shown
                this.svg.selectAll('.brush').remove();
                this.brushGraphicsContext = undefined;
            }

            // Recalculate axes now that scrollbar visible variables have been set
            axes = calculateAxes(this.layers, viewport, margin, this.categoryAxisProperties, this.valueAxisProperties, MekkoChart.TextProperties, this.isXScrollBarVisible || this.isYScrollBarVisible, null);

            // we need to make two passes because the margin changes affect the chosen tick values, which then affect the margins again.
            // after the second pass the margins are correct.
            var doneWithMargins = false,
                maxIterations = 2,
                numIterations = 0;
            var tickLabelMargins = undefined;
            var chartHasAxisLabels = undefined;
            var axisLabels: ChartAxesLabels = undefined;
            while (!doneWithMargins && numIterations < maxIterations) {
                numIterations++;
                tickLabelMargins = AxisHelper.getTickLabelMargins(
                    { width: width, height: viewport.height },
                    leftRightMarginLimit,
                    TextMeasurementService.measureSvgTextWidth,
                    TextMeasurementService.estimateSvgTextHeight,
                    axes,
                    bottomMarginLimit,
                    MekkoChart.TextProperties,
                    this.isXScrollBarVisible || this.isYScrollBarVisible,
                    showY1OnRight,
                    renderXAxis,
                    renderY1Axis,
                    renderY2Axis);

                // We look at the y axes as main and second sides, if the y axis orientation is right so the main side represents the right side
                var maxMainYaxisSide = showY1OnRight ? tickLabelMargins.yRight : tickLabelMargins.yLeft,
                    maxSecondYaxisSide = showY1OnRight ? tickLabelMargins.yLeft : tickLabelMargins.yRight,
                    xMax = tickLabelMargins.xMax;

                maxMainYaxisSide += MekkoChart.LeftPadding;
                if ((renderY2Axis && !showY1OnRight) || (showY1OnRight && renderY1Axis))
                    maxSecondYaxisSide += MekkoChart.RightPadding;
                xMax += MekkoChart.BottomPadding;

                if (this.hideAxisLabels(legendMargins)) {
                    axes.x.axisLabel = null;
                    axes.y1.axisLabel = null;
                    if (axes.y2) {
                        axes.y2.axisLabel = null;
                    }
                }

                this.addUnitTypeToAxisLabel(axes);

                axisLabels = { x: axes.x.axisLabel, y: axes.y1.axisLabel, y2: axes.y2 ? axes.y2.axisLabel : null };
                chartHasAxisLabels = (axisLabels.x != null) || (axisLabels.y != null || axisLabels.y2 != null);

                if (axisLabels.x != null)
                    xMax += MekkoChart.XAxisLabelPadding;
                if (axisLabels.y != null)
                    maxMainYaxisSide += MekkoChart.YAxisLabelPadding;
                if (axisLabels.y2 != null)
                    maxSecondYaxisSide += MekkoChart.YAxisLabelPadding;

                margin.left = showY1OnRight ? maxSecondYaxisSide : maxMainYaxisSide;
                margin.right = showY1OnRight ? maxMainYaxisSide : maxSecondYaxisSide;
                margin.bottom = xMax;
                this.margin = margin;

                width = viewport.width - (margin.left + margin.right);

                // re-calculate the axes with the new margins
                var previousTickCountY1 = axes.y1.values.length;
                var previousTickCountY2 = axes.y2 && axes.y2.values.length;
                axes = calculateAxes(this.layers, viewport, margin, this.categoryAxisProperties, this.valueAxisProperties, MekkoChart.TextProperties, this.isXScrollBarVisible || this.isYScrollBarVisible, axes);

                // the minor padding adjustments could have affected the chosen tick values, which would then need to calculate margins again
                // e.g. [0,2,4,6,8] vs. [0,5,10] the 10 is wider and needs more margin.
                if (axes.y1.values.length === previousTickCountY1 && (!axes.y2 || axes.y2.values.length === previousTickCountY2))
                    doneWithMargins = true;
            }

            if (this.isXScrollBarVisible) {
                mainAxisScale = axes.x.scale;
                var brushX = this.margin.left;
                var brushY = viewport.height;
                this.renderChartWithScrollBar(mainAxisScale, brushX, brushY, preferredViewport.width, viewport, axes, width, tickLabelMargins, chartHasAxisLabels, axisLabels, suppressAnimations);
            }
            else if (this.isYScrollBarVisible) {
                mainAxisScale = axes.y1.scale;
                var brushX = viewport.width;
                var brushY = this.margin.top;
                this.renderChartWithScrollBar(mainAxisScale, brushX, brushY, preferredViewport.height, viewport, axes, width, tickLabelMargins, chartHasAxisLabels, axisLabels, suppressAnimations);
            }
            else {
                this.renderChart(mainAxisScale, axes, width, tickLabelMargins, chartHasAxisLabels, axisLabels, viewport, suppressAnimations);
            }
        }

        private hideAxisLabels(legendMargins: IViewport): boolean {
            if (this.cartesianSmallViewPortProperties) {
                if (this.cartesianSmallViewPortProperties.hideAxesOnSmallViewPort && ((this.currentViewport.height + legendMargins.height) < this.cartesianSmallViewPortProperties.MinHeightAxesVisible) && !this.visualInitOptions.interactivity.isInteractiveLegend) {
                    return true;
                }
            }
            return false;
        }

        private renderChartWithScrollBar(
            inputMainAxisScale: D3.Scale.GenericScale<any>,
            brushX: number,
            brushY: number,
            svgLength: number,
            viewport: IViewport,
            axes: CartesianAxisProperties,
            width: number,
            tickLabelMargins: any,
            chartHasAxisLabels: boolean,
            axisLabels: ChartAxesLabels,
            suppressAnimations: boolean): void {

            var mainAxisScale = <D3.Scale.OrdinalScale>inputMainAxisScale;
            var scrollScale = this.scrollScale = <D3.Scale.OrdinalScale>mainAxisScale.copy();
            var brush = this.brush;
            var scrollSpaceLength;
            var marginTop = this.margin.top;
            var marginLeft = this.margin.left;
            var marginRight = this.margin.right;
            var marginBottom = this.margin.bottom;
            var minExtent;

            if (this.isXScrollBarVisible) {
                scrollSpaceLength = viewport.width - (marginLeft + marginRight);
                minExtent = this.getMinExtent(svgLength, scrollSpaceLength);
                scrollScale.rangeBands([0, scrollSpaceLength]);
                brush.x(scrollScale)
                    .extent([0, minExtent]);
            }
            else {
                scrollSpaceLength = viewport.height - (marginTop + marginBottom);
                minExtent = this.getMinExtent(svgLength, scrollSpaceLength);
                scrollScale.rangeBands([0, scrollSpaceLength]);
                brush.y(scrollScale)
                    .extent([0, minExtent]);
            }

            this.brushMinExtent = minExtent;

            brush
                .on("brush", () => window.requestAnimationFrame(() => this.onBrushed(scrollScale, mainAxisScale, axes, width, tickLabelMargins, chartHasAxisLabels, axisLabels, viewport, scrollSpaceLength)))
                .on("brushend", () => this.onBrushEnd(minExtent));

            var brushContext = this.brushContext = this.brushGraphicsContext
                .attr({
                    "transform": SVGUtil.translate(brushX, brushY),
                    "drag-resize-disabled": "true" /*disables resizing of the visual when dragging the scrollbar in edit mode*/
                })
                .call(brush);  /*call the brush function, causing it to create the rectangles   */              
              
            /* Disabling the zooming feature */
            brushContext.selectAll(".resize rect")
                .remove();

            brushContext.select(".background")
                .style('cursor', 'default');

            brushContext.selectAll(".extent")
                .style({
                    "fill-opacity": MekkoChart.fillOpacity,
                    "cursor": "default",
                });

            if (this.isXScrollBarVisible)
                brushContext.selectAll("rect").attr("height", MekkoChart.ScrollBarWidth);
            else
                brushContext.selectAll("rect").attr("width", MekkoChart.ScrollBarWidth);

            if (mainAxisScale && scrollScale) {
                mainAxisScale.rangeBands([0, scrollSpaceLength]);
                this.renderChart(mainAxisScale, axes, width, tickLabelMargins, chartHasAxisLabels, axisLabels, viewport, suppressAnimations, scrollScale, brush.extent());
            }
        }

        private getMinExtent(svgLength: number, scrollSpaceLength: number): number {
            return scrollSpaceLength * scrollSpaceLength / (svgLength);
        }

        private onBrushEnd(minExtent: number): void {
            var brushContext = this.brushContext;
            if (this.isXScrollBarVisible) {
                brushContext.select(".extent").attr("width", minExtent);
            }
            else
                brushContext.select(".extent").attr("height", minExtent);
        }

        private onBrushed(scrollScale: any, mainAxisScale: any, axes: CartesianAxisProperties, width: number, tickLabelMargins: any, chartHasAxisLabels: boolean, axisLabels: ChartAxesLabels, viewport: IViewport, scrollSpaceLength: number): void {
            var brush = this.brush;

            if (mainAxisScale && scrollScale) {
                MekkoChart.clampBrushExtent(this.brush, scrollSpaceLength, this.brushMinExtent);
                var extent = brush.extent();
                this.renderChart(mainAxisScale, axes, width, tickLabelMargins, chartHasAxisLabels, axisLabels, viewport, true /* suppressAnimations */, scrollScale, extent);
            }
        }
        
        /**
         * To show brush every time when mouse is clicked on the empty background.
         */
        private setMinBrush(scrollSpaceLength: number, minExtent: number): void {
            MekkoChart.clampBrushExtent(this.brush, scrollSpaceLength, minExtent);
        }

        private static getUnitType(axis: CartesianAxisProperties, axisPropertiesLookup: (axis: CartesianAxisProperties) => IAxisProperties) {
            if (axisPropertiesLookup(axis).formatter &&
                axisPropertiesLookup(axis).formatter.displayUnit &&
                axisPropertiesLookup(axis).formatter.displayUnit.value > 1)
                return axisPropertiesLookup(axis).formatter.displayUnit.title;
            return null;
        }

        private static clampBrushExtent(brush: D3.Svg.Brush, viewportWidth: number, minExtent: number): void {
            var extent = brush.extent();
            var width = extent[1] - extent[0];

            if (width === minExtent && extent[1] <= viewportWidth && extent[0] >= 0)
                return;

            if (width > minExtent) {
                var padding = (width - minExtent) / 2;
                extent[0] += padding;
                extent[1] -= padding;
            }

            else if (width < minExtent) {
                var padding = (minExtent - width) / 2;
                extent[0] -= padding;
                extent[1] += padding;
            }

            if (extent[0] < 0) {
                extent[0] = 0;
                extent[1] = minExtent;
            }

            else if (extent[0] > viewportWidth - minExtent) {
                extent[0] = viewportWidth - minExtent;
                extent[1] = viewportWidth;
            }

            brush.extent(extent);
        }

        private getMaxMarginFactor(): number {
            return this.visualInitOptions.style.maxMarginFactor || MekkoChart.MaxMarginFactor;
        }

        private static getChartViewport(viewport: IViewport, margin: IMargin): IViewport {
            return {
                width: viewport.width - margin.left - margin.right,
                height: viewport.height - margin.top - margin.bottom,
            };
        }

        private renderChart(
            mainAxisScale: any,
            axes: CartesianAxisProperties,
            width: number,
            tickLabelMargins: any,
            chartHasAxisLabels: boolean,
            axisLabels: ChartAxesLabels,
            viewport: IViewport,
            suppressAnimations: boolean,
            scrollScale?: any,
            extent?: number[]) {

            var bottomMarginLimit = this.bottomMarginLimit;
            var leftRightMarginLimit = this.leftRightMarginLimit;
            var layers = this.layers;
            var duration = AnimatorCommon.GetAnimationDuration(this.animator, suppressAnimations);
            var chartViewport = MekkoChart.getChartViewport(viewport, this.margin);

            debug.assertValue(layers, 'layers');

            // Filter data that fits viewport
            if (scrollScale) {
                var selected: number[];
                var data: CartesianData[] = [];

                var startValue = extent[0];
                var endValue = extent[1];

                var pixelStepSize = scrollScale(1) - scrollScale(0);
                var startIndex = Math.floor(startValue / pixelStepSize);
                var sliceLength = Math.ceil((endValue - startValue) / pixelStepSize);
                var endIndex = startIndex + sliceLength; //intentionally one past the end index for use with slice(start,end)
                var domain = scrollScale.domain();

                mainAxisScale.domain(domain);
                selected = domain.slice(startIndex, endIndex); //up to but not including 'end'
                if (selected && selected.length > 0) {
                    for (var i = 0; i < layers.length; i++) {
                        data[i] = layers[i].setFilteredData(selected[0], selected[selected.length - 1] + 1);
                    }
                    mainAxisScale.domain(selected);

                    var axisPropsToUpdate: IAxisProperties;
                    if (this.isXScrollBarVisible) {
                        axisPropsToUpdate = axes.x;
                    }
                    else {
                        axisPropsToUpdate = axes.y1;
                    }

                    axisPropsToUpdate.axis.scale(mainAxisScale);
                    axisPropsToUpdate.scale(mainAxisScale);

                    // tick values are indices for ordinal axes
                    axisPropsToUpdate.axis.ticks(selected.length);
                    axisPropsToUpdate.axis.tickValues(selected); 

                    // use the original tick format to format the tick values
                    var tickFormat = axisPropsToUpdate.axis.tickFormat();
                    axisPropsToUpdate.values = _.map(selected, (d) => tickFormat(d));
                }
            }

            var xLabelColor: Fill;
            var yLabelColor: Fill;
            var y2LabelColor: Fill;
            //hide show x-axis here
            if (this.shouldRenderAxis(axes.x)) {
                if (axes.x.isCategoryAxis) {
                    xLabelColor = this.categoryAxisProperties && this.categoryAxisProperties['labelColor'] ? this.categoryAxisProperties['labelColor'] : null;
                } else {
                    xLabelColor = this.valueAxisProperties && this.valueAxisProperties['labelColor'] ? this.valueAxisProperties['labelColor'] : null;
                }
                axes.x.axis.orient("bottom");
                if (!axes.x.willLabelsFit)
                    axes.x.axis.tickPadding(MekkoChart.TickPaddingRotatedX);

                var xAxisGraphicsElement = this.xAxisGraphicsContext;
                if (duration) {
                    xAxisGraphicsElement
                        .transition()
                        .duration(duration)
                        .call(axes.x.axis);
                }
                else {
                    xAxisGraphicsElement
                        .call(axes.x.axis);
                }

                xAxisGraphicsElement
                    .call(MekkoChart.darkenZeroLine)
                    .call(MekkoChart.setAxisLabelColor, xLabelColor);

                var xAxisTextNodes = xAxisGraphicsElement.selectAll('text');
                if (axes.x.willLabelsWordBreak) {
                    xAxisTextNodes
                        .call(AxisHelper.LabelLayoutStrategy.wordBreak, axes.x, bottomMarginLimit);
                } else {
                    xAxisTextNodes
                        .call(AxisHelper.LabelLayoutStrategy.rotate,
                        bottomMarginLimit,
                        TextMeasurementService.svgEllipsis,
                        !axes.x.willLabelsFit,
                        bottomMarginLimit === tickLabelMargins.xMax,
                        axes.x,
                        this.margin,
                        this.isXScrollBarVisible || this.isYScrollBarVisible);
                }
            }
            else {
                this.xAxisGraphicsContext.selectAll('*').remove();
            }

            if (this.shouldRenderAxis(axes.y1)) {
                if (axes.y1.isCategoryAxis) {
                    yLabelColor = this.categoryAxisProperties && this.categoryAxisProperties['labelColor'] ? this.categoryAxisProperties['labelColor'] : null;
                } else {
                    yLabelColor = this.valueAxisProperties && this.valueAxisProperties['labelColor'] ? this.valueAxisProperties['labelColor'] : null;
                }
                var yAxisOrientation = this.yAxisOrientation;
                var showY1OnRight = yAxisOrientation === yAxisPosition.right;
                axes.y1.axis
                    .tickSize(-width)
                    .tickPadding(MekkoChart.TickPaddingY)
                    .orient(yAxisOrientation.toLowerCase());

                var y1AxisGraphicsElement = this.y1AxisGraphicsContext;
                if (duration) {
                    y1AxisGraphicsElement
                        .transition()
                        .duration(duration)
                        .call(axes.y1.axis);
                }
                else {
                    y1AxisGraphicsElement
                        .call(axes.y1.axis);
                }

                y1AxisGraphicsElement
                    .call(MekkoChart.darkenZeroLine)
                    .call(MekkoChart.setAxisLabelColor, yLabelColor);

                if (tickLabelMargins.yLeft >= leftRightMarginLimit) {
                    y1AxisGraphicsElement.selectAll('text')
                        .call(AxisHelper.LabelLayoutStrategy.clip,
                        // Can't use padding space to render text, so subtract that from available space for ellipses calculations
                        leftRightMarginLimit - MekkoChart.LeftPadding,
                        TextMeasurementService.svgEllipsis);
                }

                if (axes.y2 && (!this.valueAxisProperties || this.valueAxisProperties['secShow'] == null || this.valueAxisProperties['secShow'])) {
                    y2LabelColor = this.valueAxisProperties && this.valueAxisProperties['secLabelColor'] ? this.valueAxisProperties['secLabelColor'] : null;

                    axes.y2.axis
                        .tickPadding(MekkoChart.TickPaddingY)
                        .orient(showY1OnRight ? yAxisPosition.left.toLowerCase() : yAxisPosition.right.toLowerCase());

                    if (duration) {
                        this.y2AxisGraphicsContext
                            .transition()
                            .duration(duration)
                            .call(axes.y2.axis);
                    }
                    else {
                        this.y2AxisGraphicsContext
                            .call(axes.y2.axis);
                    }

                    this.y2AxisGraphicsContext
                        .call(MekkoChart.darkenZeroLine)
                        .call(MekkoChart.setAxisLabelColor, y2LabelColor);

                    if (tickLabelMargins.yRight >= leftRightMarginLimit) {
                        this.y2AxisGraphicsContext.selectAll('text')
                            .call(AxisHelper.LabelLayoutStrategy.clip,
                            // Can't use padding space to render text, so subtract that from available space for ellipses calculations
                            leftRightMarginLimit - MekkoChart.RightPadding,
                            TextMeasurementService.svgEllipsis);
                    }
                }
                else {
                    this.y2AxisGraphicsContext.selectAll('*').remove();
                }
            }
            else {
                this.y1AxisGraphicsContext.selectAll('*').remove();
                this.y2AxisGraphicsContext.selectAll('*').remove();
            }

            // Axis labels
            //TODO: Add label for second Y axis for combo chart
            if (chartHasAxisLabels) {
                var hideXAxisTitle = !this.shouldRenderAxis(axes.x, "showAxisTitle");
                var hideYAxisTitle = !this.shouldRenderAxis(axes.y1, "showAxisTitle");
                var hideY2AxisTitle = this.valueAxisProperties && this.valueAxisProperties["secShowAxisTitle"] != null && this.valueAxisProperties["secShowAxisTitle"] === false;

                var renderAxisOptions: AxisRenderingOptions = {
                    axisLabels: axisLabels,
                    legendMargin: this.legendMargins.height,
                    viewport: viewport,
                    hideXAxisTitle: hideXAxisTitle,
                    hideYAxisTitle: hideYAxisTitle,
                    hideY2AxisTitle: hideY2AxisTitle,
                    xLabelColor: xLabelColor,
                    yLabelColor: yLabelColor,
                    y2LabelColor: y2LabelColor
                };

                this.renderAxesLabels(renderAxisOptions);
            }
            else {
                this.axisGraphicsContext.selectAll('.xAxisLabel').remove();
                this.axisGraphicsContext.selectAll('.yAxisLabel').remove();
            }

            this.translateAxes(viewport);

            //Render chart columns            
            if (this.behavior) {
                var dataPoints: SelectableDataPoint[] = [];
                var layerBehaviorOptions: any[] = [];
                var labelDataPoints: LabelDataPoint[] = [];
                for (var i = 0, len = layers.length; i < len; i++) {
                    var result = layers[i].render(suppressAnimations);
                    if (result) {
                        dataPoints = dataPoints.concat(result.dataPoints);
                        layerBehaviorOptions.push(result.behaviorOptions);
                        labelDataPoints = labelDataPoints.concat(result.labelDataPoints);
                    }
                }
                labelDataPoints = NewDataLabelUtils.removeDuplicates(labelDataPoints);
                var labelLayout = new LabelLayout({
                    maximumOffset: NewDataLabelUtils.maxLabelOffset,
                    startingOffset: NewDataLabelUtils.startingLabelOffset
                });
                var dataLabels = labelLayout.layout(labelDataPoints, chartViewport);
                if (layers.length > 1) {
                    NewDataLabelUtils.drawLabelBackground(this.labelGraphicsContextScrollable, dataLabels, "#FFFFFF", 0.7);
                }
                if (this.animator && !suppressAnimations) {
                    NewDataLabelUtils.animateDefaultLabels(this.labelGraphicsContextScrollable, dataLabels, this.animator.getDuration());
                }
                else {
                    NewDataLabelUtils.drawDefaultLabels(this.labelGraphicsContextScrollable, dataLabels);
                }
                if (this.interactivityService) {
                    var behaviorOptions: CartesianBehaviorOptions = {
                        layerOptions: layerBehaviorOptions,
                        clearCatcher: this.clearCatcher,
                    };
                    this.interactivityService.bind(dataPoints, this.behavior, behaviorOptions);
                }
            }
            else {
                var labelDataPoints: LabelDataPoint[] = [];
                for (var i = 0, len = layers.length; i < len; i++) {
                    var result = layers[i].render(suppressAnimations);
                    if (result) // Workaround until out of date mobile render path for line chart is removed
                        labelDataPoints = labelDataPoints.concat(result.labelDataPoints);
                }
                labelDataPoints = NewDataLabelUtils.removeDuplicates(labelDataPoints);
                var labelLayout = new LabelLayout({
                    maximumOffset: NewDataLabelUtils.maxLabelOffset,
                    startingOffset: NewDataLabelUtils.startingLabelOffset
                });
                var dataLabels = labelLayout.layout(labelDataPoints, chartViewport);
                if (layers.length > 1) {
                    NewDataLabelUtils.drawLabelBackground(this.labelGraphicsContextScrollable, dataLabels, "#FFFFFF", 0.7);
                }
                NewDataLabelUtils.drawDefaultLabels(this.labelGraphicsContextScrollable, dataLabels);
            }
        }
        
        /**
         * Within the context of the given selection (g), find the offset of
         * the zero tick using the d3 attached datum of g.tick elements.
         * 'Classed' is undefined for transition selections
         */
        private static darkenZeroLine(g: D3.Selection): void {
            var zeroTick = g.selectAll('g.tick').filter((data) => data === 0).node();
            if (zeroTick) {
                d3.select(zeroTick).select('line').classed('zero-line', true);
            }
        }

        private static setAxisLabelColor(g: D3.Selection, fill: Fill): void {
            g.selectAll('g.tick text').style('fill', fill ? fill.solid.color : null);
        }
        
        /**
         * Returns the actual viewportWidth if visual is not scrollable.
         * @return If visual is scrollable, returns the plot area needed to draw all the datapoints.
         */
        public static getPreferredPlotArea(
            categoryCount: number,
            categoryThickness: number,
            viewport: IViewport,
            isScrollable: boolean,
            isScalar: boolean): IViewport {

            var preferredViewport: IViewport = {
                height: viewport.height,
                width: viewport.width
            };
            if (!isScalar && isScrollable) {
                var preferredWidth = MekkoChart.getPreferredCategorySpan(categoryCount, categoryThickness);
                preferredViewport.width = Math.max(preferredWidth, viewport.width);
            }
            return preferredViewport;
        }

        /**
         * Returns preferred Category span if the visual is scrollable.
         */
        public static getPreferredCategorySpan(categoryCount: number, categoryThickness: number): number {
            return categoryThickness * (categoryCount + (MekkoChart.OuterPaddingRatio * 2));
        }
        
        /**
         * Note: Public for testing access.
         */
        public static getLayout(data: ColumnChartData, options: CategoryLayoutOptions): CategoryLayout {
            var categoryCount = options.categoryCount,
                availableWidth = options.availableWidth,
                domain = options.domain,
                isScalar = !!options.isScalar,
                isScrollable = !!options.isScrollable;

            var categoryThickness = MekkoChart.getCategoryThickness(data ? data.series : null, categoryCount, availableWidth, domain, isScalar);

            // Total width of the outer padding, the padding that exist on the far right and far left of the chart.
            var totalOuterPadding = categoryThickness * MekkoChart.OuterPaddingRatio * 2;

            // visibleCategoryCount will be used to discard data that overflows on ordinal-axis charts.
            // Needed for dashboard visuals            
            var calculatedBarCount = Math.round((availableWidth - totalOuterPadding) / categoryThickness);
            var visibleCategoryCount = Math.min(calculatedBarCount, categoryCount);

            var outerPaddingRatio = MekkoChart.OuterPaddingRatio;
            if (!isScalar) {
                // use dynamic outer padding
                var oneOuterPadding = (availableWidth - (categoryThickness * visibleCategoryCount)) / 2;
                outerPaddingRatio = oneOuterPadding / categoryThickness;
            }

            // If scrollable, visibleCategoryCount will be total categories
            if (!isScalar && isScrollable)
                visibleCategoryCount = categoryCount;

            return {
                categoryCount: visibleCategoryCount,
                categoryThickness: categoryThickness,
                outerPaddingRatio: outerPaddingRatio,
                isScalar: isScalar
            };
        }

        /** 
         * Returns the thickness for each category.
         * For clustered charts, you still need to divide by
         * the number of series to get column width after calling this method.
         * For linear or time scales, category thickness accomodates for
         * the minimum interval between consequtive points.
         * For all types, return value has accounted for outer padding,
         * but not inner padding.
         */
        public static getCategoryThickness(seriesList: CartesianSeries[], numCategories: number, plotLength: number, domain: number[], isScalar: boolean): number {
            var thickness;
            if (numCategories < 2)
                thickness = plotLength * (1 - MekkoChart.OuterPaddingRatio);
            else if (isScalar && domain && domain.length > 1) {
                // the smallest interval defines the column width.
                var minInterval = MekkoChart.getMinInterval(seriesList);
                var domainSpan = domain[domain.length - 1] - domain[0];
                // account for outside padding
                var ratio = minInterval / (domainSpan + (minInterval * MekkoChart.OuterPaddingRatio * 2));
                thickness = plotLength * ratio;
                thickness = Math.max(thickness, MekkoChart.MinScalarRectThickness);
            }
            else {
                // Divide the available width up including outer padding (in terms of category thickness) on
                // both sides of the chart, and categoryCount categories. Reverse math:
                // availableWidth = (categoryThickness * categoryCount) + (categoryThickness * (outerPadding * 2)),
                // availableWidth = categoryThickness * (categoryCount + (outerPadding * 2)),
                // categoryThickness = availableWidth / (categoryCount + (outerpadding * 2))
                thickness = plotLength / (numCategories + (MekkoChart.OuterPaddingRatio * 2));
                thickness = Math.max(thickness, MekkoChart.MinOrdinalRectThickness);
            }
            
            // spec calls for using the whole plot area, but the max rectangle thickness is "as if there were three categories"
            // (outerPaddingRatio has the same units as '# of categories' so they can be added)
            var maxRectThickness = plotLength / (3 + (MekkoChart.OuterPaddingRatio * 2));

            if (!isScalar && numCategories >= 3)
                return Math.max(Math.min(thickness, maxRectThickness), MekkoChart.MinOrdinalRectThickness);

            return Math.min(thickness, maxRectThickness);
        }

        private static getMinInterval(seriesList: CartesianSeries[]): number {
            var minInterval = Number.MAX_VALUE;
            if (seriesList.length > 0) {
                var series0data = seriesList[0].data.filter(d => !d.highlight);
                for (var i = 0, ilen = series0data.length - 1; i < ilen; i++) {
                    minInterval = Math.min(minInterval, Math.abs(series0data[i + 1].categoryValue - series0data[i].categoryValue));
                }
            }
            return minInterval;
        }
    }

    function getLayerData(dataViews: DataView[], currentIdx: number, totalLayers: number): DataView[] {
        if (totalLayers > 1) {
            if (dataViews && dataViews.length > currentIdx)
                return [dataViews[currentIdx]];
            return [];
        }

        return dataViews;
    }

    function hasMultipleYAxes(layers: ICartesianVisual[]): boolean {
        debug.assertValue(layers, 'layers');

        return layers.length > 1;
    }

    /**
     * Returns a boolean, that indicates if y axis title should be displayed.
     * @return True if y axis title should be displayed,
     * otherwise false.
     */
    function shouldShowYAxisLabel(layerNumber: number, valueAxisProperties: DataViewObject, yAxisWillMerge: boolean): boolean {
        return ((layerNumber === 0 && !!valueAxisProperties && !!valueAxisProperties['showAxisTitle']) ||
            (layerNumber === 1 && !yAxisWillMerge && !!valueAxisProperties && !!valueAxisProperties['secShowAxisTitle']));
    }

    function tryMergeYDomains(layers: ICartesianVisual[], visualOptions: CalculateScaleAndDomainOptions): MergedValueAxisResult {
        debug.assert(layers.length < 3, 'merging of more than 2 layers is not supported');

        var noMerge: MergedValueAxisResult = {
            domain: undefined,
            merged: false,
            tickCount: undefined,
            forceStartToZero: false
        };

        if (layers.length < 2)
            return noMerge;

        var min: number;
        var max: number;
        var minOfMax: number;
        var maxOfMin: number;

        // TODO: replace full calculateAxesProperties with just a data domain calc
        // we need to be aware of which chart require zero (column/bar) and which don't (line)
        var y1props = layers[0].calculateAxesProperties(visualOptions)[1];
        var y2props = layers[1].calculateAxesProperties(visualOptions)[1];
        var firstYDomain = y1props.scale.domain();
        var secondYDomain = y2props.scale.domain();

        if (firstYDomain[0] >= 0 && secondYDomain[0] >= 0) {
            noMerge.forceStartToZero = true;
        }

        if (y1props.values && y1props.values.length > 0 && y2props.values && y2props.values.length > 0) {
            noMerge.tickCount = Math.max(y1props.values.length, y2props.values.length);
        }

        min = Math.min(firstYDomain[0], secondYDomain[0]);
        max = Math.max(firstYDomain[1], secondYDomain[1]);

        if (visualOptions.forceMerge) {
            return {
                domain: [min, max],
                merged: true,
                tickCount: noMerge.tickCount,
                forceStartToZero: false
            };
        }

        // If domains don't intersect don't merge axis.
        if (firstYDomain[0] > secondYDomain[1] || firstYDomain[1] < secondYDomain[0])
            return noMerge;

        maxOfMin = Math.max(firstYDomain[0], secondYDomain[0]);
        minOfMax = Math.min(firstYDomain[1], secondYDomain[1]);

        var range = (max - min);

        if (range === 0) {
            return noMerge;
        }

        var intersection = Math.abs((minOfMax - maxOfMin) / range);

        // Only merge if intersection of domains greater than 10% of total range.
        if (intersection < COMBOCHART_DOMAIN_OVERLAP_TRESHOLD_PERCENTAGE)
            return noMerge;
        else
            return {
                domain: [min, max],
                merged: true,
                tickCount: noMerge.tickCount,
                forceStartToZero: false
            };
    }
    
    /** 
     * Computes the Cartesian Chart axes from the set of layers.
     */
    function calculateAxes(
        layers: ICartesianVisual[],
        viewport: IViewport,
        margin: IMargin,
        categoryAxisProperties: DataViewObject,
        valueAxisProperties: DataViewObject,
        textProperties: TextProperties,
        scrollbarVisible: boolean,
        existingAxisProperties: CartesianAxisProperties): CartesianAxisProperties {
        debug.assertValue(layers, 'layers');

        var visualOptions: CalculateScaleAndDomainOptions = {
            viewport: viewport,
            margin: margin,
            forcedXDomain: [categoryAxisProperties ? categoryAxisProperties['start'] : null, categoryAxisProperties ? categoryAxisProperties['end'] : null],
            forceMerge: valueAxisProperties && valueAxisProperties['secShow'] === false,
            showCategoryAxisLabel: false,
            showValueAxisLabel: false,
            categoryAxisScaleType: categoryAxisProperties && categoryAxisProperties['axisScale'] != null ? <string>categoryAxisProperties['axisScale'] : axisScale.linear,
            valueAxisScaleType: valueAxisProperties && valueAxisProperties['axisScale'] != null ? <string>valueAxisProperties['axisScale'] : axisScale.linear
        };

        var skipMerge = valueAxisProperties && valueAxisProperties['secShow'] === true;
        var yAxisWillMerge = false;
        var mergeResult: MergedValueAxisResult;
        if (hasMultipleYAxes(layers) && !skipMerge) {
            mergeResult = tryMergeYDomains(layers, visualOptions);
            yAxisWillMerge = mergeResult.merged;
            if (yAxisWillMerge) {
                visualOptions.forcedYDomain = mergeResult.domain;
            }
            else {
                visualOptions.forcedTickCount = mergeResult.tickCount;
            }
        }

        if (valueAxisProperties) {
            visualOptions.forcedYDomain = AxisHelper.applyCustomizedDomain([valueAxisProperties['start'], valueAxisProperties['end']], visualOptions.forcedYDomain);
        }

        var result: CartesianAxisProperties;
        for (var layerNumber = 0, len = layers.length; layerNumber < len; layerNumber++) {
            var currentlayer = layers[layerNumber];

            if (layerNumber === 1 && !yAxisWillMerge) {
                visualOptions.forcedYDomain = valueAxisProperties ? [valueAxisProperties['secStart'], valueAxisProperties['secEnd']] : null;
                visualOptions.valueAxisScaleType = valueAxisProperties && valueAxisProperties['secAxisScale'] != null ? <string>valueAxisProperties['secAxisScale'] : axisScale.linear;
                if (mergeResult && mergeResult.forceStartToZero) {
                    if (!visualOptions.forcedYDomain) {
                        visualOptions.forcedYDomain = [0, undefined];
                    }
                    else if (visualOptions.forcedYDomain[0] == null) {
                        visualOptions.forcedYDomain[0] = 0;//only set when user didn't choose a value
                    }
                }
            }
            visualOptions.showCategoryAxisLabel = (!!categoryAxisProperties && !!categoryAxisProperties['showAxisTitle']);//here

            visualOptions.showValueAxisLabel = shouldShowYAxisLabel(layerNumber, valueAxisProperties, yAxisWillMerge);

            var axes = currentlayer.calculateAxesProperties(visualOptions);

            if (layerNumber === 0) {
                result = {
                    x: axes[0],
                    y1: axes[1]
                };
            }
            else if (axes && !result.y2) {
                if (axes[0].axis.scale().domain().length > result.x.axis.scale().domain().length) {
                    visualOptions.showValueAxisLabel = (!!valueAxisProperties && !!valueAxisProperties['showAxisTitle']);

                    var axes = currentlayer.calculateAxesProperties(visualOptions);
                    // no categories returned for the first layer, use second layer x-axis properties
                    result.x = axes[0];
                    // and 2nd value axis to be the primary
                    result.y1 = axes[1];
                }
                else {
                    // make sure all layers use the same x-axis/scale for drawing
                    currentlayer.overrideXScale(result.x);
                    if (!yAxisWillMerge && !axes[1].usingDefaultDomain)
                        result.y2 = axes[1];
                }
            }

            if (existingAxisProperties && existingAxisProperties.x) {
                result.x.willLabelsFit = existingAxisProperties.x.willLabelsFit;
                result.x.willLabelsWordBreak = existingAxisProperties.x.willLabelsWordBreak;
            } else {
                var width = viewport.width - (margin.left + margin.right);
                result.x.willLabelsFit = AxisHelper.LabelLayoutStrategy.willLabelsFit(
                    result.x,
                    width,
                    TextMeasurementService.measureSvgTextWidth,
                    textProperties);

                // If labels do not fit and we are not scrolling, try word breaking
                result.x.willLabelsWordBreak = (!result.x.willLabelsFit && !scrollbarVisible) && AxisHelper.LabelLayoutStrategy.willLabelsWordBreak(
                    result.x,
                    margin,
                    width,
                    TextMeasurementService.measureSvgTextWidth,
                    TextMeasurementService.estimateSvgTextHeight,
                    TextMeasurementService.getTailoredTextOrDefault,
                    textProperties);
            }
        }

        return result;
    }

    export function createLayers(
        type: MekkoChartType,
        objects: DataViewObjects,
        interactivityService: IInteractivityService,
        animator?: any,
        isScrollable: boolean = false,
        seriesLabelFormattingEnabled: boolean = false): ICartesianVisual[] {

        var layers: ICartesianVisual[] = [];

        var cartesianOptions: CartesianVisualConstructorOptions = {
            isScrollable: isScrollable,
            animator: animator,
            interactivityService: interactivityService,
            seriesLabelFormattingEnabled: seriesLabelFormattingEnabled,
        };

        layers.push(createMekkoChartLayer(ColumnChartType.hundredPercentStackedColumn, cartesianOptions));

        return layers;
    }

    function createMekkoChartLayer(type: ColumnChartType, defaultOptions: CartesianVisualConstructorOptions): MekkoColumnChart {
        var options: ColumnChartConstructorOptions = {
            animator: <IColumnChartAnimator>defaultOptions.animator,
            interactivityService: defaultOptions.interactivityService,
            isScrollable: defaultOptions.isScrollable,
            seriesLabelFormattingEnabled: defaultOptions.seriesLabelFormattingEnabled,
            chartType: type
        };
        return new MekkoColumnChart(options);
    }

    import EnumExtensions = jsCommon.EnumExtensions;
    import ArrayExtensions = jsCommon.ArrayExtensions;

    var flagBar: number = 1 << 1;
    var flagColumn: number = 1 << 2;
    //var flagClustered: number = 1 << 3;
    var flagStacked: number = 1 << 4;
    var flagStacked100: number = flagStacked | (1 << 5);

    var RoleNames = {
        category: 'Category',
        series: 'Series',
        y: 'Y',
        width: 'Width'
    };

    /**
     * Renders a stacked and clustered column chart.
     */
    export class MekkoColumnChart implements ICartesianVisual {
        private static ColumnChartClassName = 'columnChart';

        public static SeriesClasses: ClassAndSelector = createClassAndSelector("series");

        private svg: D3.Selection;
        private mainGraphicsContext: D3.Selection;
        private labelGraphicsContext: D3.Selection;
        private xAxisProperties: IAxisProperties;
        private yAxisProperties: IAxisProperties;
        private currentViewport: IViewport;
        private data: ColumnChartData;
        private style: IVisualStyle;
        private colors: IDataColorPalette;
        private chartType: ColumnChartType;
        private columnChart: IColumnChartStrategy;
        private hostService: IVisualHostServices;
        private cartesianVisualHost: ICartesianVisualHost;
        private interactivity: InteractivityOptions;
        private margin: IMargin;
        private options: CartesianVisualInitOptions;
        private lastInteractiveSelectedColumnIndex: number;
        private supportsOverflow: boolean;
        private interactivityService: IInteractivityService;
        private dataViewCat: DataViewCategorical;
        private categoryAxisType: string;
        private animator: IColumnChartAnimator;
        private isScrollable: boolean;
        private element: JQuery;
        private seriesLabelFormattingEnabled: boolean;

        constructor(options: ColumnChartConstructorOptions) {
            debug.assertValue(options, 'options');

            var chartType = options.chartType;
            debug.assertValue(chartType, 'chartType');
            this.chartType = chartType;
            this.categoryAxisType = null;
            this.animator = options.animator;
            this.isScrollable = options.isScrollable;
            this.interactivityService = options.interactivityService;
            this.seriesLabelFormattingEnabled = options.seriesLabelFormattingEnabled;
        }

        public static customizeQuery(options: CustomizeQueryOptions): void {
            var dataViewMapping = options.dataViewMappings[0];
            if (!dataViewMapping || !dataViewMapping.categorical || !dataViewMapping.categorical.categories)
                return;

            if (options.preferHigherDataVolume) {
                dataViewMapping.categorical.dataVolume = 4;
            }

            var dataViewCategories = <data.CompiledDataViewRoleForMappingWithReduction>dataViewMapping.categorical.categories;
            var categoryItems = dataViewCategories.for.in.items;
            if (!ArrayExtensions.isUndefinedOrEmpty(categoryItems)) {
                var categoryType = categoryItems[0].type;

                var objects: DataViewObjects;
                if (dataViewMapping.metadata)
                    objects = dataViewMapping.metadata.objects;

                if (CartesianChart.getIsScalar(objects, columnChartProps.categoryAxis.axisType, categoryType))
                    dataViewCategories.dataReductionAlgorithm = { sample: {} };
            }
        }

        public static getSortableRoles(options: VisualSortableOptions): string[] {
            var dataViewMapping = options.dataViewMappings[0];
            if (!dataViewMapping || !dataViewMapping.categorical || !dataViewMapping.categorical.categories)
                return null;

            var dataViewCategories = <data.CompiledDataViewRoleForMappingWithReduction>dataViewMapping.categorical.categories;
            var categoryItems = dataViewCategories.for.in.items;
            if (!ArrayExtensions.isUndefinedOrEmpty(categoryItems)) {
                var categoryType = categoryItems[0].type;

                var objects: DataViewObjects;
                if (dataViewMapping.metadata)
                    objects = dataViewMapping.metadata.objects;

                //TODO: column chart should be sortable by X if it has scalar axis
                // But currenly it doesn't support this. Return 'category' once
                // it is supported.
                if (!CartesianChart.getIsScalar(objects, columnChartProps.categoryAxis.axisType, categoryType)) {
                    return ['Category', 'Y'];
                }
            }

            return null;
        }

        public updateVisualMetadata(x: IAxisProperties, y: IAxisProperties, margin) {
            this.xAxisProperties = x;
            this.yAxisProperties = y;
            this.margin = margin;
        }

        public init(options: CartesianVisualInitOptions) {
            this.svg = options.svg;
            this.mainGraphicsContext = this.svg.append('g').classed('columnChartMainGraphicsContext', true);
            this.labelGraphicsContext = this.svg.append('g').classed(NewDataLabelUtils.labelGraphicsContextClass.class, true);
            this.style = options.style;
            this.currentViewport = options.viewport;
            this.hostService = options.host;
            this.interactivity = options.interactivity;
            this.colors = this.style.colorPalette.dataColors;
            this.cartesianVisualHost = options.cartesianHost;
            this.options = options;
            this.supportsOverflow = !EnumExtensions.hasFlag(this.chartType, flagStacked);
            var element = this.element = options.element;
            element.addClass(MekkoColumnChart.ColumnChartClassName);

            switch (this.chartType) {
                default:
                    this.columnChart = new MekkoChartStrategy();
                    break;
            }
        }

        private getCategoryLayout(numCategoryValues: number, options: CalculateScaleAndDomainOptions): CategoryLayout {
            var availableWidth: number;
            if (EnumExtensions.hasFlag(this.chartType, flagBar)) {
                availableWidth = this.currentViewport.height - (this.margin.top + this.margin.bottom);
            }
            else {
                availableWidth = this.currentViewport.width - (this.margin.left + this.margin.right);
            }

            var metaDataColumn = this.data ? this.data.categoryMetadata : undefined;
            var categoryDataType: ValueType = AxisHelper.getCategoryValueType(metaDataColumn);
            var isScalar = this.data ? this.data.scalarCategoryAxis : false;
            var domain = AxisHelper.createDomain(this.data.series, categoryDataType, isScalar, options.forcedXDomain);
            return CartesianChart.getLayout(
                this.data,
                {
                    availableWidth: availableWidth,
                    categoryCount: numCategoryValues,
                    domain: domain,
                    isScalar: isScalar,
                    isScrollable: this.isScrollable
                });
        }

        public static converter(dataView: DataViewCategorical, colors: IDataColorPalette, is100PercentStacked: boolean = false, isScalar: boolean = false, supportsOverflow: boolean = false, dataViewMetadata: DataViewMetadata = null, chartType?: ColumnChartType): ColumnChartData {
            debug.assertValue(dataView, 'dataView');
            debug.assertValue(colors, 'colors');
            //console.log(dataView);

            var xAxisCardProperties = CartesianHelper.getCategoryAxisProperties(dataViewMetadata);
            var valueAxisProperties = CartesianHelper.getValueAxisProperties(dataViewMetadata);
            isScalar = CartesianHelper.isScalar(isScalar, xAxisCardProperties);
            dataView = ColumnUtil.applyUserMinMax(isScalar, dataView, xAxisCardProperties);

            var converterStrategy = new ColumnChartConverterHelper(dataView);

            var categoryInfo = converterHelper.getPivotedCategories(dataView, columnChartProps.general.formatString);
            var categories = categoryInfo.categories,
                categoryFormatter: IValueFormatter = categoryInfo.categoryFormatter,
                categoryIdentities: DataViewScopeIdentity[] = categoryInfo.categoryIdentities,
                categoryMetadata: DataViewMetadataColumn = dataView.categories && dataView.categories.length > 0 ? dataView.categories[0].source : undefined,
                labelFormatString: string = dataView.values && dataView.values[0] ? valueFormatter.getFormatString(dataView.values[0].source, columnChartProps.general.formatString) : undefined;

            var labelSettings: VisualDataLabelsSettings = dataLabelUtils.getDefaultColumnLabelSettings(is100PercentStacked || EnumExtensions.hasFlag(chartType, flagStacked), labelFormatString);
            var defaultDataPointColor = undefined;
            var showAllDataPoints = undefined;
            if (dataViewMetadata && dataViewMetadata.objects) {
                var objects = dataViewMetadata.objects;

                defaultDataPointColor = DataViewObjects.getFillColor(objects, columnChartProps.dataPoint.defaultColor);
                showAllDataPoints = DataViewObjects.getValue<boolean>(objects, columnChartProps.dataPoint.showAllDataPoints);

                var labelsObj = <DataLabelObject>objects['labels'];
                dataLabelUtils.updateLabelSettingsFromLabelsObject(labelsObj, labelSettings);
            }

            // Allocate colors
            var legendAndSeriesInfo = converterStrategy.getLegend(colors, defaultDataPointColor);
            var legend: LegendDataPoint[] = legendAndSeriesInfo.legend.dataPoints;
            var seriesSources: DataViewMetadataColumn[] = legendAndSeriesInfo.seriesSources;            

            // Determine data points
            var result = MekkoColumnChart.createDataPoints(
                dataView,
                categories,
                categoryIdentities,
                legend,
                legendAndSeriesInfo.seriesObjects,
                converterStrategy,
                labelSettings,
                is100PercentStacked,
                isScalar,
                supportsOverflow,
                converterHelper.categoryIsAlsoSeriesRole(dataView, RoleNames.series, RoleNames.category),
                categoryInfo.categoryObjects,
                defaultDataPointColor,
                chartType,
                categoryMetadata);
            var columnSeries: ColumnChartSeries[] = result.series;

            var valuesMetadata: DataViewMetadataColumn[] = [];
            for (var j = 0, jlen = legend.length; j < jlen; j++) {
                valuesMetadata.push(seriesSources[j]);
            }

            var labels = converterHelper.createAxesLabels(xAxisCardProperties, valueAxisProperties, categoryMetadata, valuesMetadata);

            if (!EnumExtensions.hasFlag(chartType, flagColumn)) {
                // Replace between x and y axes
                var temp = labels.xAxisLabel;
                labels.xAxisLabel = labels.yAxisLabel;
                labels.yAxisLabel = temp;
            }

            return {
                categories: categories,
                categoryFormatter: categoryFormatter,
                series: columnSeries,
                valuesMetadata: valuesMetadata,
                legendData: legendAndSeriesInfo.legend,
                hasHighlights: result.hasHighlights,
                categoryMetadata: categoryMetadata,
                scalarCategoryAxis: isScalar,
                labelSettings: labelSettings,
                axesLabels: { x: labels.xAxisLabel, y: labels.yAxisLabel },
                hasDynamicSeries: result.hasDynamicSeries,
                defaultDataPointColor: defaultDataPointColor,
                showAllDataPoints: showAllDataPoints,
                isMultiMeasure: false,
            };
        }

        private static createDataPoints(
            dataViewCat: DataViewCategorical,
            categories: any[],
            categoryIdentities: DataViewScopeIdentity[],
            legend: LegendDataPoint[],
            seriesObjectsList: DataViewObjects[][],
            converterStrategy: ColumnChartConverterHelper,
            defaultLabelSettings: VisualDataLabelsSettings,
            is100PercentStacked: boolean = false,
            isScalar: boolean = false,
            supportsOverflow: boolean = false,
            isCategoryAlsoSeries?: boolean,
            categoryObjectsList?: DataViewObjects[],
            defaultDataPointColor?: string,
            chartType?: ColumnChartType,
            categoryMetadata?: DataViewMetadataColumn): { series: ColumnChartSeries[]; hasHighlights: boolean; hasDynamicSeries: boolean; } {

            var grouped = dataViewCat && dataViewCat.values ? dataViewCat.values.grouped() : undefined;
            
            var categoryCount = categories.length;
            var seriesCount = legend.length;
            var columnSeries: ColumnChartSeries[] = [];

            if (seriesCount < 1 || categoryCount < 1)
                return { series: columnSeries, hasHighlights: false, hasDynamicSeries: false };

            var dvCategories = dataViewCat.categories;
            categoryMetadata = (dvCategories && dvCategories.length > 0)
                ? dvCategories[0].source
                : null;
            var categoryType = AxisHelper.getCategoryValueType(categoryMetadata);
            var isDateTime = AxisHelper.isDateTime(categoryType);
            var baseValuesPos = [], baseValuesNeg = [];

            var rawValues: number[][] = [];
            var rawHighlightValues: number[][] = [];

            var hasDynamicSeries = !!(dataViewCat.values && dataViewCat.values.source);
            var widthColumns = [];
            var widthIndex = -1;

            var highlightsOverflow = false; // Overflow means the highlight larger than value or the signs being different
            var hasHighlights = converterStrategy.hasHighlightValues(0);
            for (var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
                if (dataViewCat.values[seriesIndex].source.roles &&
                    dataViewCat.values[seriesIndex].source.roles[RoleNames.width]) {
                    widthIndex = seriesIndex;
                    continue;
                }
                var seriesValues = [];
                var seriesHighlightValues = [];
                for (var categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
                    var value = converterStrategy.getValueBySeriesAndCategory(seriesIndex, categoryIndex);
                    seriesValues[categoryIndex] = value;
                    if (hasHighlights) {
                        var highlightValue = converterStrategy.getHighlightBySeriesAndCategory(seriesIndex, categoryIndex);
                        seriesHighlightValues[categoryIndex] = highlightValue;
                        // There are two cases where we don't use overflow logic; if all are false, use overflow logic appropriate for the chart.
                        if (!((value >= 0 && highlightValue >= 0 && value >= highlightValue) || // Both positive; value greater than highlight
                            (value <= 0 && highlightValue <= 0 && value <= highlightValue))) { // Both negative; value less than highlight
                            highlightsOverflow = true;
                        }
                    }
                }
                rawValues.push(seriesValues);
                if (hasHighlights) {
                    rawHighlightValues.push(seriesHighlightValues);
                }
            }

            if (highlightsOverflow && !supportsOverflow) {
                highlightsOverflow = false;
                hasHighlights = false;
                rawValues = rawHighlightValues;
            }
            
            var widthColumns = [];

            if (widthIndex >= 0) {
                widthColumns = dataViewCat.values[widthIndex].values;
                seriesCount--;
                legend.splice(widthIndex, 1);
            } else {
                for (seriesIndex = 0; seriesIndex < categoryCount; seriesIndex++) {
                    widthColumns.push(1);
                }
            }
          // console.log(widthColumns);
            
           var totalSum = d3.sum(widthColumns);
           var linearScale = d3.scale.linear()
                    .domain([0, totalSum])
                    .range([0, 1]);
            
            var total = [0];
            for (seriesIndex = 0; seriesIndex < (categoryCount - 1) ; seriesIndex++) {
                 var new_total = total[total.length - 1] + widthColumns[seriesIndex] || 0;
                 //console.log('new_total: ', new_total, new_total);
                 total.push(new_total);
            }
           /*
           console.log(widthColumns);
           console.log(total);
           */
            for (seriesIndex = 0; seriesIndex < categoryCount; seriesIndex++) {
                 total[seriesIndex] = linearScale(total[seriesIndex]);
                 widthColumns[seriesIndex] = linearScale(widthColumns[seriesIndex]);
            }
           /*
            console.log('widthColumns', widthColumns);
            console.log('total', total);
           */

            //var mas       = [0.2, 0.3, 0.1, 0.1, 0.2, 0.1];
            //var total = [0, 0.2, 0.5, 0.6, 0.7, 0.9];

            var dataPointObjects: DataViewObjects[] = categoryObjectsList,
                formatStringProp = columnChartProps.general.formatString;
            for (var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
                var seriesDataPoints: ColumnChartDataPoint[] = [],
                    legendItem = legend[seriesIndex],
                    seriesLabelSettings: VisualDataLabelsSettings;

                if (!hasDynamicSeries) {
                    var labelsSeriesGroup = grouped && grouped.length > 0 && grouped[0].values ? grouped[0].values[seriesIndex] : null;
                    var labelObjects = (labelsSeriesGroup && labelsSeriesGroup.source && labelsSeriesGroup.source.objects) ? <DataLabelObject>labelsSeriesGroup.source.objects['labels'] : null;
                    if (labelObjects) {
                        seriesLabelSettings = Prototype.inherit(defaultLabelSettings);
                        dataLabelUtils.updateLabelSettingsFromLabelsObject(labelObjects, seriesLabelSettings);
                    }
                }

                columnSeries.push({
                    displayName: legendItem.label,
                    key: 'series' + seriesIndex,
                    index: seriesIndex,
                    data: seriesDataPoints,
                    identity: legendItem.identity,
                    color: legendItem.color,
                    labelSettings: seriesLabelSettings,
                });

                if (seriesCount > 1)
                    dataPointObjects = seriesObjectsList[seriesIndex];
                var metadata = dataViewCat.values[seriesIndex].source;

                for (var categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
                    if (seriesIndex === 0) {
                        baseValuesPos.push(0);
                        baseValuesNeg.push(0);
                    }

                    var value = AxisHelper.normalizeNonFiniteNumber(rawValues[seriesIndex][categoryIndex]);
                    if (value == null) {
                        // Optimization: Ignore null dataPoints from the fabricated category/series combination in the self cross-join.
                        // However, we must retain the first series because it is used to compute things like axis scales, and value lookups.
                        if (seriesIndex > 0)
                            continue;
                    }

                    var originalValue: number = value;
                    var categoryValue = categories[categoryIndex];
                    if (isDateTime && categoryValue)
                        categoryValue = categoryValue.getTime();
                    if (isScalar && (categoryValue == null || isNaN(categoryValue)))
                        continue;

                    var multipliers: ValueMultiplers;
                    if (is100PercentStacked)
                        multipliers = StackedUtil.getStackedMultiplier(dataViewCat, categoryIndex, seriesCount, categoryCount, converterStrategy);

                    var unadjustedValue = value,
                        isNegative = value < 0;

                    if (multipliers) {
                        if (isNegative)
                            value *= multipliers.neg;
                        else
                            value *= multipliers.pos;
                    }

                    var valueAbsolute = Math.abs(value);
                    var position: number;
                    if (isNegative) {
                        position = baseValuesNeg[categoryIndex];

                        if (!isNaN(valueAbsolute))
                            baseValuesNeg[categoryIndex] -= valueAbsolute;
                    }
                    else {
                        if (!isNaN(valueAbsolute))
                            baseValuesPos[categoryIndex] += valueAbsolute;

                        position = baseValuesPos[categoryIndex];
                    }

                    var seriesGroup = grouped && grouped.length > seriesIndex && grouped[seriesIndex].values ? grouped[seriesIndex].values[0] : null;
                    var category = dataViewCat.categories && dataViewCat.categories.length > 0 ? dataViewCat.categories[0] : null;
                    var identity = SelectionIdBuilder.builder()
                        .withCategory(category, categoryIndex)
                        .withSeries(dataViewCat.values, seriesGroup)
                        .withMeasure(converterStrategy.getMeasureNameByIndex(seriesIndex))
                        .createSelectionId();

                    var rawCategoryValue = categories[categoryIndex];
                    var color = MekkoColumnChart.getDataPointColor(legendItem, categoryIndex, dataPointObjects);
                    var tooltipInfo: TooltipDataItem[] = TooltipBuilder.createTooltipInfo(formatStringProp, dataViewCat, rawCategoryValue, originalValue, null, null, seriesIndex, categoryIndex);
                    var series = columnSeries[seriesIndex];
                    var dataPointLabelSettings = (series.labelSettings) ? series.labelSettings : defaultLabelSettings;
                    var labelColor = dataPointLabelSettings.labelColor;
                    var lastValue = undefined;
                    //Stacked column/bar label color is white by default (except last series)
                    if ((EnumExtensions.hasFlag(chartType, flagStacked))) {
                        lastValue = this.getStackedLabelColor(isNegative, seriesIndex, seriesCount, categoryIndex, rawValues);
                        labelColor = (lastValue || (seriesIndex === seriesCount - 1 && !isNegative)) ? labelColor : dataLabelUtils.defaultInsideLabelColor;
                    }

                    var dataPoint: ColumnChartDataPoint = {
                        categoryValue: categoryValue,
                        value: widthColumns[categoryIndex],//value,
                        position: position,
                        valueAbsolute: valueAbsolute,
                        valueOriginal: unadjustedValue,
                        seriesIndex: seriesIndex,
                        labelSettings: dataPointLabelSettings,
                        categoryIndex: categoryIndex,
                        color: color,
                        selected: false,
                        originalValue: value,
                        originalPosition: total[categoryIndex],//position,
                        originalValueAbsolute: valueAbsolute,
                        identity: identity,
                        key: identity.getKey(),
                        tooltipInfo: tooltipInfo,
                        labelFill: labelColor,
                        labelFormatString: metadata.format,
                        lastSeries: lastValue,
                        chartType: chartType
                    };

                    seriesDataPoints.push(dataPoint);

                    if (hasHighlights) {
                        var valueHighlight = rawHighlightValues[seriesIndex][categoryIndex];
                        var unadjustedValueHighlight = valueHighlight;

                        var highlightedTooltip: boolean = true;
                        if (valueHighlight === null) {
                            valueHighlight = 0;
                            highlightedTooltip = false;
                        }

                        if (is100PercentStacked) {
                            valueHighlight *= multipliers.pos;
                        }
                        var absoluteValueHighlight = Math.abs(valueHighlight);
                        var highlightPosition = position;

                        if (valueHighlight > 0) {
                            highlightPosition -= valueAbsolute - absoluteValueHighlight;
                        }
                        else if (valueHighlight === 0 && value > 0) {
                            highlightPosition -= valueAbsolute;
                        }

                        var highlightIdentity = SelectionId.createWithHighlight(identity);
                        var rawCategoryValue = categories[categoryIndex];
                        var highlightedValue: number = highlightedTooltip ? valueHighlight : undefined;
                        var tooltipInfo: TooltipDataItem[] = TooltipBuilder.createTooltipInfo(formatStringProp, dataViewCat, rawCategoryValue, originalValue, null, null, seriesIndex, categoryIndex, highlightedValue);

                        if (highlightedTooltip) {
                            // Override non highlighted data point
                            dataPoint.tooltipInfo = tooltipInfo;
                        }

                        var highlightDataPoint: ColumnChartDataPoint = {
                            categoryValue: categoryValue,
                            value: valueHighlight,
                            position: highlightPosition,
                            valueAbsolute: absoluteValueHighlight,
                            valueOriginal: unadjustedValueHighlight,
                            seriesIndex: seriesIndex,
                            labelSettings: dataPointLabelSettings,
                            categoryIndex: categoryIndex,
                            color: color,
                            selected: false,
                            highlight: true,
                            originalValue: value,
                            originalPosition: position,
                            originalValueAbsolute: valueAbsolute,
                            drawThinner: highlightsOverflow,
                            identity: highlightIdentity,
                            key: highlightIdentity.getKey(),
                            tooltipInfo: tooltipInfo,
                            labelFormatString: metadata.format,
                            labelFill: labelColor,
                            lastSeries: lastValue,
                            chartType: chartType
                        };

                        seriesDataPoints.push(highlightDataPoint);
                    }
                }
            }

            return {
                series: columnSeries,
                hasHighlights: hasHighlights,
                hasDynamicSeries: hasDynamicSeries,
            };
        }

        private static getDataPointColor(
            legendItem: LegendDataPoint,
            categoryIndex: number,
            dataPointObjects?: DataViewObjects[]): string {
            debug.assertValue(legendItem, 'legendItem');
            debug.assertValue(categoryIndex, 'categoryIndex');
            debug.assertAnyValue(dataPointObjects, 'dataPointObjects');

            if (dataPointObjects) {
                var colorOverride = DataViewObjects.getFillColor(dataPointObjects[categoryIndex], columnChartProps.dataPoint.fill);
                if (colorOverride)
                    return colorOverride;
            }

            return legendItem.color;
        }

        private static getStackedLabelColor(isNegative: boolean, seriesIndex: number, seriesCount: number, categoryIndex: number, rawValues: number[][]): boolean {
            var lastValue = !(isNegative && seriesIndex === seriesCount - 1 && seriesCount !== 1);
            //run for the next series and check if current series is last
            for (var i = seriesIndex + 1; i < seriesCount; i++) {
                var nextValues = AxisHelper.normalizeNonFiniteNumber(rawValues[i][categoryIndex]);
                if ((nextValues !== null) && (((!isNegative || (isNegative && seriesIndex === 0)) && nextValues > 0) || (isNegative && seriesIndex !== 0))) {
                    lastValue = false;
                    break;
                }
            }
            return lastValue;
        }

        public static sliceSeries(series: ColumnChartSeries[], endIndex: number, startIndex: number = 0): ColumnChartSeries[] {
            var newSeries: ColumnChartSeries[] = [];
            if (series && series.length > 0) {
                for (var i = 0, len = series.length; i < len; i++) {
                    var iNewSeries = newSeries[i] = Prototype.inherit(series[i]);
                    // TODO: [investigate] possible perf improvement.
                    // if data[n].categoryIndex > endIndex implies data[n+1].categoryIndex > endIndex
                    // then we could short circuit the filter loop.
                    iNewSeries.data = series[i].data.filter(d => d.categoryIndex >= startIndex && d.categoryIndex < endIndex);
                }
            }
            return newSeries;
        }

        public static getForcedTickValues(min: number, max: number, forcedTickCount: number): number[] {
            debug.assert(min <= max, "min must be less or equal to max");
            debug.assert(forcedTickCount >= 0, "forcedTickCount must be greater or equal to zero");
            if (forcedTickCount <= 1)
                return [];

            var tickValues = [];
            var interval = (max - min) / (forcedTickCount - 1);
            for (var i = 0; i < forcedTickCount - 1; i++) {
                tickValues.push(min + i * interval);
            }
            tickValues.push(max);

            if (tickValues.indexOf(0) === -1)
                tickValues.push(0);

            // It's not needed to sort the array here since when we pass tick value array to D3,
            // D3 does not care whether the elements in the array are in order or not.
            return tickValues;
        }

        public static getTickInterval(tickValues: number[]): number {
            if (tickValues.length === 0)
                return 0;

            if (tickValues.length === 1)
                return tickValues[0];

            tickValues.sort((a, b) => (a - b));
            return tickValues[1] - tickValues[0];
        }

        public static getInteractiveColumnChartDomElement(element: JQuery): HTMLElement {
            return element.children("svg").get(0);
        }

        public setData(dataViews: DataView[]): void {
            debug.assertValue(dataViews, "dataViews");
            var is100PctStacked = EnumExtensions.hasFlag(this.chartType, flagStacked100);
            this.data = {
                categories: [],
                categoryFormatter: null,
                series: [],
                valuesMetadata: [],
                legendData: null,
                hasHighlights: false,
                categoryMetadata: null,
                scalarCategoryAxis: false,
                labelSettings: dataLabelUtils.getDefaultColumnLabelSettings(is100PctStacked || EnumExtensions.hasFlag(this.chartType, flagStacked)),
                axesLabels: { x: null, y: null },
                hasDynamicSeries: false,
                defaultDataPointColor: null,
                isMultiMeasure: false,
            };

            if (dataViews.length > 0) {
                var dataView = dataViews[0];

                if (dataView && dataView.categorical) {
                    var dataViewCat = this.dataViewCat = dataView.categorical;
                    var dvCategories = dataViewCat.categories;
                    var categoryMetadata = (dvCategories && dvCategories.length > 0)
                        ? dvCategories[0].source
                        : null;
                    var categoryType = AxisHelper.getCategoryValueType(categoryMetadata);

                    this.data = MekkoColumnChart.converter(
                        dataViewCat,
                        this.cartesianVisualHost.getSharedColors(),
                        is100PctStacked,
                        CartesianChart.getIsScalar(dataView.metadata ? dataView.metadata.objects : null, columnChartProps.categoryAxis.axisType, categoryType),
                        this.supportsOverflow,
                        dataView.metadata,
                        this.chartType);

                    var series = this.data.series;
                    for (var i = 0, ilen = series.length; i < ilen; i++) {
                        var currentSeries = series[i];
                        if (this.interactivityService) {
                            this.interactivityService.applySelectionStateToData(currentSeries.data);
                        }
                    }
                }
            }
        }

        public calculateLegend(): LegendData {
            // if we're in interactive mode, return the interactive legend 
            if (this.interactivity && this.interactivity.isInteractiveLegend) {
                return this.createInteractiveLegendDataPoints(0);
            }
            var legendData = this.data ? this.data.legendData : null;
            var legendDataPoints = legendData ? legendData.dataPoints : [];

            if (ArrayExtensions.isUndefinedOrEmpty(legendDataPoints))
                return null;

            return legendData;
        }

        public hasLegend(): boolean {
            return this.data && (this.data.hasDynamicSeries || (this.data.series && this.data.series.length > 1));
        }

        public enumerateObjectInstances(enumeration: ObjectEnumerationBuilder, options: EnumerateVisualObjectInstancesOptions): void {
            switch (options.objectName) {
                case 'dataPoint':
                    if (!GradientUtils.hasGradientRole(this.dataViewCat))
                        this.enumerateDataPoints(enumeration);
                    break;
                case 'labels':
                    this.enumerateDataLabels(enumeration);
                    break;
            }
        }

        private enumerateDataLabels(enumeration: ObjectEnumerationBuilder): void {
            var data = this.data,
                labelSettings = this.data.labelSettings,
                seriesCount = data.series.length;

            //Draw default settings
            dataLabelUtils.enumerateDataLabels(this.getLabelSettingsOptions(enumeration, labelSettings, false));

            if (seriesCount === 0)
                return;

            //Draw series settings
            if (!data.hasDynamicSeries && (seriesCount > 1 || !data.categoryMetadata) && this.seriesLabelFormattingEnabled) {
                for (var i = 0; i < seriesCount; i++) {
                    var series = data.series[i],
                        labelSettings: VisualDataLabelsSettings = (series.labelSettings) ? series.labelSettings : this.data.labelSettings;

                    //enumeration.pushContainer({ displayName: series.displayName });
                    dataLabelUtils.enumerateDataLabels(this.getLabelSettingsOptions(enumeration, labelSettings, true, series));
                    //enumeration.popContainer();
                }
            }
        }

        private getLabelSettingsOptions(enumeration: ObjectEnumerationBuilder, labelSettings: VisualDataLabelsSettings, isSeries: boolean, series?: ColumnChartSeries): VisualDataLabelsSettingsOptions {
            return {
                enumeration: enumeration,
                dataLabelsSettings: labelSettings,
                show: !isSeries,
                displayUnits: !EnumExtensions.hasFlag(this.chartType, flagStacked100),
                precision: true,
                selector: series && series.identity ? series.identity.getSelector() : null
            };
        }

        private enumerateDataPoints(enumeration: ObjectEnumerationBuilder): void {
            var data = this.data;
            if (!data)
                return;

            var seriesCount = data.series.length;

            if (seriesCount === 0)
                return;

            if (data.hasDynamicSeries || seriesCount > 1 || !data.categoryMetadata) {
                for (var i = 0; i < seriesCount; i++) {
                    var series = data.series[i];
                    enumeration.pushInstance({
                        objectName: 'dataPoint',
                        displayName: series.displayName,
                        selector: ColorHelper.normalizeSelector(series.identity.getSelector()),
                        properties: {
                            fill: { solid: { color: series.color } }
                        },
                    });
                }
            }
            else {
                // For single-category, single-measure column charts, the user can color the individual bars.
                var singleSeriesData = data.series[0].data;
                var categoryFormatter = data.categoryFormatter;

                // Add default color and show all slices
                enumeration.pushInstance({
                    objectName: 'dataPoint',
                    selector: null,
                    properties: {
                        defaultColor: { solid: { color: data.defaultDataPointColor || this.colors.getColorByIndex(0).value } }
                    }
                }).pushInstance({
                    objectName: 'dataPoint',
                    selector: null,
                    properties: {
                        showAllDataPoints: !!data.showAllDataPoints
                    }
                });

                for (var i = 0; i < singleSeriesData.length; i++) {
                    var singleSeriesDataPoints = singleSeriesData[i],
                        categoryValue: any = data.categories[i];
                    enumeration.pushInstance({
                        objectName: 'dataPoint',
                        displayName: categoryFormatter ? categoryFormatter.format(categoryValue) : categoryValue,
                        selector: ColorHelper.normalizeSelector(singleSeriesDataPoints.identity.getSelector(), /*isSingleSeries*/true),
                        properties: {
                            fill: { solid: { color: singleSeriesDataPoints.color } }
                        },
                    });
                }
            }
        }

        public calculateAxesProperties(options: CalculateScaleAndDomainOptions): IAxisProperties[] {
            var data = this.data;
            this.currentViewport = options.viewport;
            var margin = this.margin = options.margin;

            var origCatgSize = (data && data.categories) ? data.categories.length : 0;
            var chartLayout: CategoryLayout = data ? this.getCategoryLayout(origCatgSize, options) : {
                categoryCount: 0,
                categoryThickness: CartesianChart.MinOrdinalRectThickness,
                outerPaddingRatio: CartesianChart.OuterPaddingRatio,
                isScalar: false
            };
            this.categoryAxisType = chartLayout.isScalar ? axisType.scalar : null;

            if (data && !chartLayout.isScalar && !this.isScrollable) {
                // trim data that doesn't fit on dashboard
                var catgSize = Math.min(origCatgSize, chartLayout.categoryCount);
                if (catgSize !== origCatgSize) {
                    data = Prototype.inherit(data);
                    data.series = ColumnChart.sliceSeries(data.series, catgSize);
                    data.categories = data.categories.slice(0, catgSize);
                }
            }
            this.columnChart.setData(data);

            var preferredPlotArea = this.getPreferredPlotArea(chartLayout.isScalar, chartLayout.categoryCount, chartLayout.categoryThickness);

            /* preferredPlotArea would be same as currentViewport width when there is no scrollbar. 
             In that case we want to calculate the available plot area for the shapes by subtracting the margin from available viewport */
            if (preferredPlotArea.width === this.currentViewport.width) {
                preferredPlotArea.width -= (margin.left + margin.right);
            }
            preferredPlotArea.height -= (margin.top + margin.bottom);

            var is100Pct = EnumExtensions.hasFlag(this.chartType, flagStacked100); 

            // When the category axis is scrollable the height of the category axis and value axis will be different
            // The height of the value axis would be same as viewportHeight 
            var chartContext: ColumnChartContext = {
                height: preferredPlotArea.height,
                width: preferredPlotArea.width,
                duration: 0,
                hostService: this.hostService,
                mainGraphicsContext: this.mainGraphicsContext,
                labelGraphicsContext: this.labelGraphicsContext,
                margin: this.margin,
                layout: chartLayout,
                animator: this.animator,
                interactivityService: this.interactivityService,
                viewportHeight: this.currentViewport.height - (margin.top + margin.bottom),
                viewportWidth: this.currentViewport.width - (margin.left + margin.right),
                is100Pct: is100Pct,
            };
            this.ApplyInteractivity(chartContext);
            this.columnChart.setupVisualProps(chartContext);

            var isBarChart = EnumExtensions.hasFlag(this.chartType, flagBar);

            if (isBarChart) {
                var temp = options.forcedXDomain;
                options.forcedXDomain = options.forcedYDomain;
                options.forcedYDomain = temp;
            }

            this.xAxisProperties = this.columnChart.setXScale(is100Pct, options.forcedTickCount, options.forcedXDomain, isBarChart ? options.valueAxisScaleType : options.categoryAxisScaleType);
            this.yAxisProperties = this.columnChart.setYScale(is100Pct, options.forcedTickCount, options.forcedYDomain, isBarChart ? options.categoryAxisScaleType : options.valueAxisScaleType);

            if (options.showCategoryAxisLabel && this.xAxisProperties.isCategoryAxis || options.showValueAxisLabel && !this.xAxisProperties.isCategoryAxis) {
                this.xAxisProperties.axisLabel = data.axesLabels.x;
            }
            else {
                this.xAxisProperties.axisLabel = null;
            }
            if (options.showValueAxisLabel && !this.yAxisProperties.isCategoryAxis || options.showCategoryAxisLabel && this.yAxisProperties.isCategoryAxis) {
                this.yAxisProperties.axisLabel = data.axesLabels.y;
            }
            else {
                this.yAxisProperties.axisLabel = null;
            }

            return [this.xAxisProperties, this.yAxisProperties];
        }

        public getPreferredPlotArea(isScalar: boolean, categoryCount: number, categoryThickness: number): IViewport {
            var viewport: IViewport = {
                height: this.currentViewport.height,
                width: this.currentViewport.width
            };

            if (this.isScrollable && !isScalar) {
                var preferredWidth = CartesianChart.getPreferredCategorySpan(categoryCount, categoryThickness);
                if (EnumExtensions.hasFlag(this.chartType, flagBar)) {
                    viewport.height = Math.max(preferredWidth, viewport.height);
                }
                else
                    viewport.width = Math.max(preferredWidth, viewport.width);
            }
            return viewport;
        }

        private ApplyInteractivity(chartContext: ColumnChartContext): void {
            var interactivity = this.interactivity;
            if (interactivity) {
                if (interactivity.dragDataPoint) {
                    chartContext.onDragStart = (datum: ColumnChartDataPoint) => {
                        if (!datum.identity)
                            return;

                        this.hostService.onDragStart({
                            event: <any>d3.event,
                            data: {
                                data: datum.identity.getSelector()
                            }
                        });
                    };
                }

                if (interactivity.isInteractiveLegend) {
                    var dragMove = () => {
                        var mousePoint = d3.mouse(this.mainGraphicsContext[0][0]); // get the x and y for the column area itself
                        var x: number = mousePoint[0];
                        var y: number = mousePoint[1];
                        var index: number = this.columnChart.getClosestColumnIndex(x, y);
                        this.selectColumn(index);
                    };

                    var ColumnChartSvg: EventTarget = ColumnChart.getInteractiveColumnChartDomElement(this.element);

                    //set click interaction on the visual
                    this.svg.on('click', dragMove);
                    //set click interaction on the background
                    d3.select(ColumnChartSvg).on('click', dragMove);
                    var drag = d3.behavior.drag()
                        .origin(Object)
                        .on("drag", dragMove);
                    //set drag interaction on the visual
                    this.svg.call(drag);
                    //set drag interaction on the background
                    d3.select(ColumnChartSvg).call(drag);
                }
            }
        }

        private selectColumn(indexOfColumnSelected: number, force: boolean = false): void {
            if (!force && this.lastInteractiveSelectedColumnIndex === indexOfColumnSelected) return; // same column, nothing to do here

            var legendData: LegendData = this.createInteractiveLegendDataPoints(indexOfColumnSelected);
            var legendDataPoints: LegendDataPoint[] = legendData.dataPoints;
            this.cartesianVisualHost.updateLegend(legendData);
            if (legendDataPoints.length > 0) {
                this.columnChart.selectColumn(indexOfColumnSelected, this.lastInteractiveSelectedColumnIndex);
            }
            this.lastInteractiveSelectedColumnIndex = indexOfColumnSelected;
        }

        private createInteractiveLegendDataPoints(columnIndex: number): LegendData {
            var data = this.data;
            if (!data || ArrayExtensions.isUndefinedOrEmpty(data.series))
                return { dataPoints: [] };

            var formatStringProp = columnChartProps.general.formatString;
            var legendDataPoints: LegendDataPoint[] = [];
            var category = data.categories && data.categories[columnIndex];
            var allSeries = data.series;
            var dataPoints = data.legendData && data.legendData.dataPoints;
            var converterStrategy = new ColumnChartConverterHelper(this.dataViewCat);

            for (var i = 0, len = allSeries.length; i < len; i++) {
                var measure = converterStrategy.getValueBySeriesAndCategory(i, columnIndex);
                var valueMetadata = data.valuesMetadata[i];
                var formattedLabel = converterHelper.getFormattedLegendLabel(valueMetadata, this.dataViewCat.values, formatStringProp);
                var dataPointColor: string;
                if (allSeries.length === 1) {
                    var series = allSeries[0];
                    dataPointColor = series.data.length > columnIndex && series.data[columnIndex].color;
                } else {
                    dataPointColor = dataPoints.length > i && dataPoints[i].color;
                }

                legendDataPoints.push({
                    color: dataPointColor,
                    icon: LegendIcon.Box,
                    label: formattedLabel,
                    category: data.categoryFormatter ? data.categoryFormatter.format(category) : category,
                    measure: valueFormatter.format(measure, valueFormatter.getFormatString(valueMetadata, formatStringProp)),
                    identity: SelectionId.createNull(),
                    selected: false
                });
            }

            return { dataPoints: legendDataPoints };
        }

        public overrideXScale(xProperties: IAxisProperties): void {
            this.xAxisProperties = xProperties;
        }

        public render(suppressAnimations: boolean): CartesianVisualRenderResult {
            var columnChartDrawInfo = this.columnChart.drawColumns(!suppressAnimations /* useAnimations */);
            var data = this.data;

            TooltipManager.addTooltip(columnChartDrawInfo.shapesSelection, (tooltipEvent: TooltipEvent) => tooltipEvent.data.tooltipInfo);
            var allDataPoints: ColumnChartDataPoint[] = [];
            var behaviorOptions: ColumnBehaviorOptions = undefined;
            if (this.interactivityService) {
                for (var i = 0, ilen = data.series.length; i < ilen; i++) {
                    allDataPoints = allDataPoints.concat(data.series[i].data);
                }
                behaviorOptions = {
                    datapoints: allDataPoints,
                    bars: columnChartDrawInfo.shapesSelection,
                    hasHighlights: data.hasHighlights,
                    mainGraphicsContext: this.mainGraphicsContext,
                    viewport: columnChartDrawInfo.viewport,
                    axisOptions: columnChartDrawInfo.axisOptions,
                    showLabel: data.labelSettings.show
                };
            }

            if (this.interactivity && this.interactivity.isInteractiveLegend) {
                if (this.data.series.length > 0) {
                    this.selectColumn(0, true); // start with the first column
                }
            }
            SVGUtil.flushAllD3TransitionsIfNeeded(this.options);
            return { dataPoints: allDataPoints, behaviorOptions: behaviorOptions, labelDataPoints: columnChartDrawInfo.labelDataPoints };
        }

        public onClearSelection(): void {
            if (this.interactivityService) {
                this.interactivityService.clearSelection();
            }
        }

        public getVisualCategoryAxisIsScalar(): boolean {
            return this.data ? this.data.scalarCategoryAxis : false;
        }

        public getSupportedCategoryAxisType(): string {
            var metaDataColumn = this.data ? this.data.categoryMetadata : undefined;
            var valueType = AxisHelper.getCategoryValueType(metaDataColumn);
            var isOrdinal = AxisHelper.isOrdinal(valueType);
            return isOrdinal ? axisType.categorical : axisType.both;
        }

        public setFilteredData(startIndex: number, endIndex: number): CartesianData {
            var data = Prototype.inherit(this.data);
            data.series = ColumnChart.sliceSeries(data.series, endIndex, startIndex);
            data.categories = data.categories.slice(startIndex, endIndex);
            this.columnChart.setData(data);
            return data;
        }
    }

    class ColumnChartConverterHelper implements IColumnChartConverterStrategy {
        private dataView: DataViewCategorical;

        constructor(dataView: DataViewCategorical) {
            this.dataView = dataView;
        }

        public getLegend(colors: IDataColorPalette, defaultColor?: string): LegendSeriesInfo {
            var legend: LegendDataPoint[] = [];
            var seriesSources: DataViewMetadataColumn[] = [];
            var seriesObjects: DataViewObjects[][] = [];
            var grouped: boolean = false;

            var colorHelper = new ColorHelper(colors, columnChartProps.dataPoint.fill, defaultColor);
            var legendTitle = undefined;
            if (this.dataView && this.dataView.values) {
                var allValues = this.dataView.values;
                var valueGroups = allValues.grouped();

                var hasDynamicSeries = !!(allValues && allValues.source);

                var formatStringProp = columnChartProps.general.formatString;
                for (var valueGroupsIndex = 0, valueGroupsLen = valueGroups.length; valueGroupsIndex < valueGroupsLen; valueGroupsIndex++) {
                    var valueGroup = valueGroups[valueGroupsIndex],
                        valueGroupObjects = valueGroup.objects,
                        values = valueGroup.values;

                    for (var valueIndex = 0, valuesLen = values.length; valueIndex < valuesLen; valueIndex++) {
                        var series = values[valueIndex];
                        var source = series.source;
                        // Gradient measures do not create series.
                        if (DataRoleHelper.hasRole(source, 'Gradient') && !DataRoleHelper.hasRole(source, 'Y'))
                            continue;

                        seriesSources.push(source);
                        seriesObjects.push(series.objects);

                        var selectionId = series.identity ?
                            SelectionId.createWithIdAndMeasure(series.identity, source.queryName) :
                            SelectionId.createWithMeasure(this.getMeasureNameByIndex(valueIndex));

                        var label = converterHelper.getFormattedLegendLabel(source, allValues, formatStringProp);

                        var color = hasDynamicSeries
                            ? colorHelper.getColorForSeriesValue(valueGroupObjects || source.objects, allValues.identityFields, source.groupName)
                            : colorHelper.getColorForMeasure(valueGroupObjects || source.objects, source.queryName);

                        legend.push({
                            icon: LegendIcon.Box,
                            color: color,
                            label: label,
                            identity: selectionId,
                            selected: false,
                        });

                        if (series.identity && source.groupName !== undefined) {
                            grouped = true;
                        }
                    }
                }

                var dvValues = this.dataView.values;
                legendTitle = dvValues && dvValues.source ? dvValues.source.displayName : "";
            }

            var legendData = {
                title: legendTitle,
                dataPoints: legend,
                grouped: grouped,
            };

            return {
                legend: legendData,
                seriesSources: seriesSources,
                seriesObjects: seriesObjects,
            };
        }

        public getValueBySeriesAndCategory(series: number, category: number): number {
            return this.dataView.values[series].values[category];
        }

        public getMeasureNameByIndex(index: number): string {
            return this.dataView.values[index].source.queryName;
        }

        public hasHighlightValues(series: number): boolean {
            var column = this.dataView && this.dataView.values ? this.dataView.values[series] : undefined;
            return column && !!column.highlights;
        }

        public getHighlightBySeriesAndCategory(series: number, category: number): number {
            return this.dataView.values[series].highlights[category];
        }
    }
}