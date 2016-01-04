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

/// <reference path="../_references.ts"/>
module powerbi.visuals.sampleDataViews {
    import ValueType = powerbi.ValueType;
    import PrimitiveType = powerbi.PrimitiveType;
    import DataView = powerbi.DataView;
    import DataViewMetadata = powerbi.DataViewMetadata;
    import DataViewTransform = powerbi.data.DataViewTransform;

    export class SimpleCandleStickData
        extends SampleDataViews
        implements ISampleDataViewsMethods {

        public name: string = "SimpleCandleStickData";
        public displayName: string = "Simple Candlestick Data";

        public visuals: string[] = ['candleStick'];

        public getDataViews(): DataView[] {
            var fieldExpr = powerbi.data.SQExprBuilder.fieldExpr({
                column: {
                    schema: 's',
                    entity: "table1",
                    name: "country"
                }
            });

            var dataTypeNumber = ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Double);
            var dataTypeDate = ValueType.fromExtendedType(ExtendedType.Date);
            var categoryValues = ["date", "close", "open", "min", "max"];

            var dateColumn: DataViewMetadataColumn = {
                displayName: "date",
                type: dataTypeDate,
                queryName: "date",
                index: 0
            };

            var closeColumn: DataViewMetadataColumn = {
                displayName: "close",
                type: dataTypeNumber,
                queryName: "close",
                index: 1
            };

            var openColumn: DataViewMetadataColumn = {
                displayName: "open",
                type: dataTypeNumber,
                queryName: "open",
                index: 2
            };

            var minColumn: DataViewMetadataColumn = {
                displayName: "min",
                type: dataTypeNumber,
                queryName: "min",
                index: 3
            }

            var maxColumn: DataViewMetadataColumn = {
                displayName: "max",
                type: dataTypeNumber,
                queryName: "max",
                index: 4
            }

            return [{
                metadata: {
                    columns: [dateColumn, closeColumn, openColumn, minColumn, maxColumn]
                },
                table: {
                    columns: [dateColumn, closeColumn, openColumn, minColumn, maxColumn],
                    rows: [
                        ["8/8/2012", 1.2372, 1.238485, 1.2327, 1.240245],
                        ["8/9/2012", 1.229295, 1.23721, 1.22671, 1.23873],
                        ["8/10/2012", 1.228975, 1.2293, 1.22417, 1.23168],
                        ["8/12/2012", 1.22747, 1.229075, 1.22747, 1.22921],
                        ["8/13/2012", 1.23262, 1.227505, 1.22608, 1.23737],
                        ["8/14/2012", 1.232385, 1.23262, 1.23167, 1.238555],
                        ["8/15/2012", 1.228865, 1.232385, 1.22641, 1.234355],
                        ["8/16/2012", 1.23573, 1.22887, 1.225625, 1.237305],
                        ["8/17/2012", 1.2333, 1.23574, 1.22891, 1.23824],
                        ["8/19/2012", 1.23323, 1.23522, 1.23291, 1.235275],
                        ["8/20/2012", 1.2351, 1.233215, 1.22954, 1.236885],
                        ["8/21/2012", 1.247655, 1.23513, 1.23465, 1.248785],
                        ["8/22/2012", 1.25338, 1.247655, 1.24315, 1.254415],
                        ["8/23/2012", 1.255995, 1.25339, 1.252465, 1.258965],
                        ["8/24/2012", 1.2512, 1.255995, 1.248175, 1.256665],
                        ["8/26/2012", 1.25054, 1.25133, 1.25042, 1.252415],
                        ["8/27/2012", 1.25012, 1.25058, 1.249025, 1.25356],
                        ["8/28/2012", 1.2571, 1.250115, 1.24656, 1.257695],
                        ["8/29/2012", 1.253065, 1.25709, 1.251895, 1.25736],
                        ["8/30/2012", 1.25097, 1.253075, 1.248785, 1.25639],
                        ["8/31/2012", 1.25795, 1.25096, 1.249375, 1.263785],
                        ["9/2/2012", 1.257355, 1.257195, 1.256845, 1.258705],
                        ["9/3/2012", 1.258635, 1.25734, 1.25604, 1.261095],
                        ["9/4/2012", 1.25339, 1.25865, 1.25264, 1.262795],
                        ["9/5/2012", 1.26005, 1.2534, 1.250195, 1.26245],
                        ["9/6/2012", 1.26309, 1.26006, 1.256165, 1.26513],
                        ["9/7/2012", 1.281625, 1.26309, 1.262655, 1.281765],
                        ["9/9/2012", 1.279565, 1.28096, 1.27915, 1.281295],
                        ["9/10/2012", 1.27617, 1.27957, 1.27552, 1.28036],
                        ["9/11/2012", 1.28515, 1.27617, 1.2759, 1.28712],
                        ["9/12/2012", 1.290235, 1.28516, 1.281625, 1.29368]
                    ]
                }
            }];
        }
        public randomize(): void { }
    }
}