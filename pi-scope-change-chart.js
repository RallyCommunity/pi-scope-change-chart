var scope_change_chart = null;

Ext.define('Rally.technicalservices.scopeChangeChart',{
    extend: 'Rally.ui.chart.Chart',
    alias: 'widget.progresschart',

    itemId: 'rally-chart',
    chartData: {

    },
    loadMask: false,
    // chartColors : ["#E0E0E0","#00a9e0","#009933","#E0E0E0","#00a9e0","#009933"],
    chartColors : ["#CCCCCC","#00a9e0","#009933","#CCCCCC","#00a9e0","#009933"],
    
    chartConfig: {
        // colors : ["#E0E0E0","#00a9e0","#fad200","#8dc63f"],
        chart: {
            type: 'column',
            zoomType: 'xy'
        },
        title: {
            text: 'Program Increment Scope Change Chart'
        },
        // subtitle: {
        //     text: ''
        // },
        xAxis: {
            title: {
                enabled : true,
                text: 'Day'
            },
            startOnTick: true,
            endOnTick: true,
            min : 0
        },
        yAxis: [
            {
                title: {
                    text: 'Points/Count'
                },
                plotLines : [{
                    color: '#000000',
                    width: 1,
                    value: 0,
                    zIndex : 4,
                    label : {text:"-"}
                }]
            }],

        tooltip : {
            useHTML: true,
            formatter : function() {
                var that = this;
                var totaldays = that.series.data.length;
                // console.log(this);
                var pointVal = function(series) {
                    var val = series.data[that.point.x].y;
                    return !_.isNull(val) ? (val <0 ? val*-1 : val) : 0;
                };
                var sumSeries = function(seriesContains) {
                    return _.reduce( that.series.chart.series, function(sum,series) {
                        // return sum + (series.name.includes(seriesContains) ? pointVal(series) : 0);
                        return sum + ( (series.name.indexOf(seriesContains) > -1) ? pointVal(series) : 0);
                    },0);
                };
                var getSeries = function(seriesName) {
                    return _.reduce( that.series.chart.series, function(sum,series) {
                        return sum + (series.name===seriesName ? pointVal(series) : 0);
                    },0);
                };

                var pct = function(val,total) {
                    return "" + (total > 0 ? Math.round((val/total)*100) : 0)+"%";
                }

                var labelPct = function(val,total) {
                    return "" + val + " ("+pct(val,total)+"%)";
                }

                var total = _.reduce( this.series.chart.series, function(sum,series) {
                    return sum + pointVal(series);
                },0);

                var inprogress = sumSeries("InProgress");
                var completed = sumSeries("Completed");
                var notstarted = total - (completed+inprogress);
                var bs = getSeries("BaselineScope");
                var bsip = getSeries("BaselineScopeInProgress");
                var bsc = getSeries("BaselineScopeCompleted");
                var as = getSeries("AddedScope");
                var asip = getSeries("AddedScopeInProgress");
                var asc = getSeries("AddedScopeCompleted");

                var ts = bs + as;
                var tip = bsip + asip;
                var tc = bsc + asc;

                var tb = bs+bsip+bsc;
                var ta = as+asip+asc;
                var tt = tb+ta;

                var tbp = pct(tb,total);
                var tsp = pct(ta,total);
                var ttp = pct(tt,total);

                var tpl = Ext.create('Ext.Template', 
                    "<table width='100%'>" + 
                        "<tr>" +
                            "<td align='center'>Day {day} of {totaldays}</td>" +
                        "</tr>" +
                    "</table>" +
                    "<table cellpadding='2'>"+
                    "<tr>"+
                        "<td align='center'> </td>"+
                        "<td align='center' style='padding-left:15px;padding-right:15px;'>Baseline</td>"+
                        "<td align='center' style='padding-left:15px;padding-right:15px;'>Added</td>"+
                        "<td align='center' style='padding-left:15px;padding-right:15px;'><b>Total</b></td>"+
                        "<td align='center' style='padding-left:15px;padding-right:0px;'><b>Total %</b></td>"+
                    "</tr>"+

                    "<tr>"+
                        "<td>NotStarted</td>"+
                        "<td align='right' style='padding-left:15px;padding-right:15px;'>{bs}</td>"+
                        "<td align='right' style='padding-left:15px;padding-right:15px;'>{as}</td>"+
                        "<td align='right' style='padding-left:15px;padding-right:15px;'><b>{ts}</b></td>"+
                        "<td align='right' style='padding-left:15px;padding-right:0px;'><b>{tnsp}</b></td>"+  
                    "</tr>"+

                    "<tr>"+
                        "<td>In-Progress</td>"+
                        "<td align='right' style='padding-left:15px;padding-right:15px;'>{bsip}</td>"+
                        "<td align='right' style='padding-left:15px;padding-right:15px;'>{asip}</td>"+
                        "<td align='right' style='padding-left:15px;padding-right:15px;'><b>{tip}</b></td>"+
                        "<td align='right' style='padding-left:15px;padding-right:0px;'><b>{tipp}</b></td>"+
                    "</tr>"+

                    "<tr>"+
                        "<td>Completed</td>"+
                        "<td align='right' style='padding-left:15px;padding-right:15px;'>{bsc}</td>"+
                        "<td align='right' style='padding-left:15px;padding-right:15px;'>{asc}</td>"+
                        "<td align='right' style='padding-left:15px;padding-right:15px;'><b>{tc}</b></td>"+
                        "<td align='right' style='padding-left:15px;padding-right:0px;'><b>{tcp}</b></td>"+
                    "</tr>"+

                    "<tr style='padding-top:10px;'>"+
                        "<td><b>Total</b></td>"+
                        "<td align='right' style='padding-left:15px;padding-right:15px;'><b>{tb}</b></td>"+
                        "<td align='right' style='padding-left:15px;padding-right:15px;'><b>{ta}</b></td>"+
                        "<td align='right' style='padding-left:15px;padding-right:15px;'><b>{tt}</b></td>"+
                        "<td align='right' style='padding-left:15px;padding-right:0px;'><b>100%</b></td>"+
                    "</tr>"+

                     "<tr>"+
                        "<td><b>Total %</b></td>"+
                        "<td align='right' style='padding-left:15px;padding-right:15px;'><b>{tbp}</b></td>"+
                        "<td align='right' style='padding-left:15px;padding-right:15px;'><b>{tsp}</b></td>"+
                        "<td align='right' style='padding-left:15px;padding-right:15px;'><b>{ttp}</b></td>"+
                        "<td align='right' style='padding-left:15px;padding-right:0px;'><b> </b></td>"+
                    "</tr>"+
                    "</table>",

                    { compiled : true });

                 return tpl.apply(
                    {
                    series: that.series.name, day: that.point.x, totaldays: totaldays,value: (that.point.y<0?that.point.y*-1:that.point.y),
                    bs:(bs),bsip:bsip,bsc:bsc,
                    as:as,asip:asip,asc:asc,
                    ts:ts,tip:tip,tc:tc,
                    tb:tb,ta:ta,tt:tt,
                    tbp:tbp,tsp:tsp,ttp:ttp,
                    tnsp:pct(ts,total),tipp:pct(tip,total),tcp:pct(tc,total)
                });
            }
        },


        plotOptions: {
            series : {
                point : {
                    events : {
                        click : function(a) {
                            // console.log(this);
                            scope_change_chart.fireEvent("series_click",this);
                        }
                    }
                },
                pointPadding: 0.1,
                groupPadding: 0,
                borderWidth: 0
            },
            column : {
                stacking : 'normal',
            },
        }
    },

    initComponent : function() {
        this.callParent(arguments);
        this.addEvents('series_click');
    },

    constructor: function (config) {

        // this.callParent(arguments);

        scope_change_chart = this;

        this.chartData = config.chartData;

        // console.log(config);
        
        if (config.subtitle) {
            console.log("subtitle",config.subtitle);
            this.chartConfig.subtitle = { text : config.subtitle } ;
        }
        if (config.title){
            this.chartConfig.title = config.title;
        }
        this.chartConfig.xAxis.plotLines = _.map(config.iterationIndices,function(i){
            return {
                color : '#888888',
                width : 1,
                value : i
            }
        });
        this.chartConfig.xAxis.plotLines.push({
                color : '#FF0000',
                width : 2,
                value : config.baselineIndex

        });
        this.callParent(arguments);

    }
});