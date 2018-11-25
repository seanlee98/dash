import React, { Component, Fragment } from "react";
import "../../node_modules/react-vis/dist/style.css";
import Card from "@material-ui/core/Card";
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";


import {
  XYPlot,
  VerticalBarSeries,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  RadialChart
} from "react-vis";

const styles = theme => ({
    root: {
      display: "flex",
      flexWrap: "wrap"
    },
    formControl: {
      margin: theme.spacing.unit,
      minWidth: 120
    },
    selectEmpty: {
      marginTop: theme.spacing.unit * 2
    },
    horizontalSpacer: {
        marginLeft: 32,
        marginRight: 32
    },
    verticalSpacer: {
        marginTop: 12,
        marginBottom: 12
    }
  });

class SentimentPercentagePage extends Component{
    constructor(props){
        super(props);
        //const receivedData = props.data;
        this.state = {
            //mock for now
            //data: receivedData,
            data: {
                common_tweets: {
                    good_tweets: [
                        "steve jobs mark",
                        "important jeff",
                        "steve jobs"
                    ],
                    bad_tweets: [
                        "artificial intelligence",
                        "first tunnel",
                        "boring company",
                        "brick store",
                        "brick store via",
                        "boring company goes",
                    ]
                },
                cumulative_percentages:{
                    Very_Bad: 10,
                    Good: 20,
                    Average: 40,
                    Very_Good: 20,
                    Bad: 10
                },
                sentiments: [
                    {
                        average_value: 8.186492340157754,
                        interval: "2018-11-17T22:00:00",
                        sentiments: {
                            Very_Bad: 6,
                            Good: 48,
                            Average: 171,
                            Very_Good: 24,
                            Bad: 17
                        },
                        count: 266
                    },
                ],
                most_retweeted: {
                    text: "First Look at @ElonMusk's Boring Company 'Brick Store'\n#techradio \ud83d\udcfb",
                    count: 2385
                },
            },
            filteredData: [],
            currentInterval: "",
        }
    }

    createIntervalList(data) {
        if(data.sentiments){
            let intervals = [];
            data.sentiments.map((dataPoint, index) => {
                intervals.push(dataPoint.interval);
            });
            return intervals;
        }
        else{
            return [];
        }
    }

    handleIntervalChange = event => {
        const dataInterval = event.target.value;
        this.filterDataIntervals(this.state.data, dataInterval);
    };

    filterDataIntervals(data, dataInterval) {
        let filteredData = [];
        //need to check if data.sentiments is iterable 
        data.sentiments.map((dataPoint, index) => {
            if (dataPoint.interval.includes(dataInterval)) {
                filteredData.push(dataPoint);
            }
        });
        this.setState({filteredData, currentInterval: dataInterval});
      }

    formatBarDataPoints(data) {
        const dataPoints = data;
        let dataArray = [];

        dataPoints.map((dataPoint, index) => {
            const sentiments = dataPoint.sentiments;
            for (var index in sentiments) {
            dataArray.push({
                x: index,
                y: sentiments[index]
            });
            }
        });

        return dataArray;
    }

    renderBar(data){
        const dataPoints = this.formatBarDataPoints(data)
        return (
            <Fragment>
                <div>
                  <XYPlot
                    xType={"ordinal"}
                    width={500}
                    height={325}
                    yDomain={[0, 300]}
                  >
                    <VerticalGridLines />
                    <HorizontalGridLines />
                    <XAxis title="Sentiment Category" />
                    <YAxis title="Number of Tweets" />
                    <VerticalBarSeries data={dataPoints} />
                  </XYPlot>
                </div>
            </Fragment>
          );
    }

    formatPieDataPoints(data){
        const pieData = [];
        for(const key in data.cumulative_percentages){
            const dataPoint = {}
            dataPoint.angle = data.cumulative_percentages[key]
            dataPoint.radius = 5
            switch(key){
                case "Very_Bad":
                    dataPoint.label = data.cumulative_percentages[key] + "%";
                    dataPoint.color = "#ed553b"
                    break;
                case "Bad":
                    dataPoint.label = data.cumulative_percentages[key] + "%";
                    dataPoint.color = "#173f5f"
                    break;
                case "Average":
                    dataPoint.label = data.cumulative_percentages[key] + "%";
                    dataPoint.color = "#20639b"
                    break;
                case "Good":
                    dataPoint.label = data.cumulative_percentages[key] + "%";
                    dataPoint.color = "#f6d55c"
                    break;
                case "Very_Good":
                    dataPoint.label = data.cumulative_percentages[key] + "%";
                    dataPoint.color = "#3caea3"
                    break;
            }
            pieData.push(dataPoint)
        }
        return pieData
    }

    renderPie(data){
        const dataPoints = this.formatPieDataPoints(data)
        return (
            <Fragment>
                <div>
                  <RadialChart
                    data={dataPoints}
                    width={400}
                    height={450}
                    showLabels={true}
                    labelsAboveChildren={true}
                  />
                </div>
            </Fragment>
          );
    }

    renderTwitterCard(){
        return(
            <Card style={{maxWidth: 500}}>
                <CardMedia
                    style={{height: 140}}
                    image="https://kt-media-knowtechie.netdna-ssl.com/wp-content/uploads/2017/05/twitter.png"
                />
                <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                    Most Retweeted
                </Typography>
                <Typography component="p">
                    {this.convertUnicode(this.state.data.most_retweeted.text)}
                </Typography>
                <Typography component="i">
                    {this.state.data.most_retweeted.count + " retweets"}
                </Typography>
                </CardContent>
            </Card>
        )
    }

    renderLegend(){
        return(
            <div>
                <Card>
                    <CardContent>
                    <Typography component="p" variant="h2">
                        Legend
                    </Typography>
                    <br />
                    <font color="#ed553b">Very Bad Category</font>
                    <br />
                    <font color="#173f5f">Bad Category</font>
                    <br />
                    <font color="#20639b">Average Category</font>
                    <br />
                    <font color="#f6d55c">Good Category</font>
                    <br />
                    <font color="#3caea3">Very Good Category</font>
                    </CardContent>
                </Card>
            </div>
        );
    }

    convertUnicode(input) {
        return input.replace(/\\u(\w\w\w\w)/g,function(a,b) {
            var charcode = parseInt(b,16);
            return String.fromCharCode(charcode);
        });
    }

    render(){
        
        const { classes } = this.props;
        const intervals = this.createIntervalList(this.state.data);

        return(
            <form>
                <Grid
                    container
                    justify="space-evenly"
                    alignItems="center"
                    direction="row"
                >
                    <Grid item className={classes.horizontalSpacer}>
                        <Grid
                            container
                            justify="center"
                            alignItems="flex-start"
                            direction="column"
                        >
                            <Grid item>
                                <FormControl className={classes.formControl}>
                                    <InputLabel htmlFor="filter-simple">Interval</InputLabel>
                                    <Select
                                        onChange={this.handleIntervalChange}
                                        value={this.state.currentInterval != "" ? this.state.currentInterval : "Select Interval"}
                                        inputProps={{
                                            name: "interval",
                                            id: "interval-simple"
                                        }}
                                    >
                                    {
                                        intervals.map((interval,i) => (<MenuItem value={interval} >{interval}</MenuItem>))
                                    }
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item  className={classes.verticalSpacer}>
                                {this.state.filteredData.length > 0 && (
                                    this.renderBar(this.state.filteredData)
                                )}
                            </Grid>
                            <Grid item  className={classes.verticalSpacer}>
                                {this.renderTwitterCard()}
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item className={classes.horizontalSpacer}>
                        <Grid
                            container
                            justify="space-evenly"
                            alignItems="center"
                            direction="column"
                        >
                            <Grid item className={classes.verticalSpacer}>
                                {this.renderPie(this.state.data)}
                            </Grid>
                            <Grid item className={classes.horizontalSpacer}>
                                {this.renderLegend()}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </form>
        )
    }
}

SentimentPercentagePage.propTypes = {
    classes: PropTypes.object.isRequired
};
  
export default withStyles(styles)(SentimentPercentagePage);