import React, { useState, useEffect } from "react";
import Popup1 from "./Popup.js";
import Popup2 from "./Popup.js";
import Popup3 from "./Popup.js";
import { Button, Typography, TextField } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Map } from "react-map-gl";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import DeckGL from "@deck.gl/react";
import { PolygonLayer } from "@deck.gl/layers";
import { TripsLayer } from "@deck.gl/geo-layers";
import Box from "@mui/material/Box";
import {handleFileEvent, spatialRange, viewSpatial} from './apiService'


const useStyles = makeStyles((theme) => ({
  paper: {
    height: "100%",
    padding: 10,
    display: "flex",
    flexDirection: "column",
  },
  link: {
    marginTop: 10,
    component: "h6",
    align: "left",
    textDecoration: "none",
    "&:hover": { color: "red" },
  },
  media: {
    height: "100%",
  },
  Button: {
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",
    p: 1,
    m: 1,
    bgcolor: "background.paper",
    borderRadius: 1,
    marginTop: 100,
    marginLeft: 100,
  },
  h2: {
    marginLeft: "100px",
  },
}));

const DATA_URL = {
  BUILDINGS:
    "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/buildings.json", // eslint-disable-line
  TRIPS:
    "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/trips-v7.json", // eslint-disable-line
};

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000],
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight });

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70],
};

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect],
};

const INITIAL_VIEW_STATE = {
  longitude: -74,
  latitude: 40.72,
  zoom: 13,
  pitch: 45,
  bearing: 0,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

const landCover = [
  [
    [-74.0, 40.7],
    [-74.02, 40.7],
    [-74.02, 40.72],
    [-74.0, 40.72],
  ],
];

function App({
  buildings = DATA_URL.BUILDINGS,
  trips = DATA_URL.TRIPS,
  trailLength = 180,
  initialViewState = INITIAL_VIEW_STATE,
  mapStyle = MAP_STYLE,
  theme = DEFAULT_THEME,
  loopLength = 1800, // unit corresponds to the timestamp in source data
  animationSpeed = 1,
}) {
  const [openPopup1, setOpenPopup1] = useState(false);
  const [openPopup2, setOpenPopup2] = useState(false);
  const [openPopup3, setOpenPopup3] = useState(false);

  const [latitudeFrom, setlatitudeFrom] = useState('')
  const [longitudeTo, setlongitudeTo] = useState('')
  const [longitudeFrom, setlongitudeFrom] = useState('')
  const [latitudeTo, setlatitudeTo] = useState('')

  const [tripsLayer, setTripsLayer] = useState(new TripsLayer({
    id: "trips",
    data: trips,
    getPath: (d) => d.path,
    getTimestamps: (d) => d.timestamps,
    getColor: (d) => (d.vendor === 0 ? theme.trailColor0 : theme.trailColor1),
    opacity: 0.3,
    widthMinPixels: 2,
    rounded: true,
    trailLength,
    currentTime: time,

    shadowEnabled: false,
  }))

  const classes = useStyles();

  const [time, setTime] = useState(0);
  const [animation] = useState({});

  const animate = () => {
    setTime((t) => (t + animationSpeed) % loopLength);
    animation.id = window.requestAnimationFrame(animate);
  };

  const spatialTemporalRange = () => {};
  const Knn = () => {};

  useEffect(() => {
    animation.id = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animation.id);
  }, [animation]);

  const layers = [
    // This is only needed when using shadow effects
    new PolygonLayer({
      id: "ground",
      data: landCover,
      getPolygon: (f) => f,
      stroked: false,
      getFillColor: [0, 0, 0, 0],
    }),
    tripsLayer,
    new PolygonLayer
    ({
      id: "buildings",
      data: buildings,
      extruded: true,
      wireframe: false,
      opacity: 0.5,
      getPolygon: (f) => f.polygon,
      getElevation: (f) => f.height,
      getFillColor: theme.buildingColor,
      material: theme.material,
    }),
  ];

  

  return (
    <React.Fragment>
      {/* Animated Map */}
      <DeckGL
        layers={layers}
        effects={theme.effects}
        initialViewState={initialViewState}
        controller={true}
      >
        <Map reuseMaps mapStyle={mapStyle} preventStyleDiffing={true} />
      </DeckGL>

      {/* Buttons */}

      <div className={classes.Button}>
        <Button variant="contained" component="label">
          Upload
          <input hidden accept="json/*" multiple type="file" onChange={handleFileEvent} />
        </Button>
        <Button
          style={{
            borderRadius: 5,
            marginTop: "20px",
          }}
          variant="contained"
        >
          Trips layer
        </Button>
        <Button
          style={{
            borderRadius: 5,
            marginTop: "20px",
          }}
          onClick={() => setOpenPopup1(true)}
          variant="contained"
        >
          Spatial Range
        </Button>
        <Button
          style={{
            borderRadius: 5,
            marginTop: "20px",
          }}
          onClick={() => setOpenPopup2(true)}
          variant="contained"
        >
          Spatial Temporal Range
        </Button>
        <Button
          style={{
            borderRadius: 5,
            marginTop: "20px",
          }}
          onClick={() => setOpenPopup3(true)}
          variant="contained"
        >
          KNN
        </Button>
      </div>

      {/* {POPUP 1} */}
      <Popup1 openPopup={openPopup1} setOpenPopup={setOpenPopup1}>
        <Typography variant="h4">SPATIAL RANGE</Typography>
        <Typography>( "*" Required )</Typography>

        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": { m: 1, width: "25ch" },
          }}
          noValidate
          autoComplete="off"
        >
          <div>
            <TextField
              required
              id="outlined-required"
              label="Latitude From"
              defaultValue="0"
              onChange={e => setlatitudeFrom(e.target.value)}
              value={latitudeFrom}
            />
            <TextField
              required
              id="outlined-required"
              label="Latitude To"
              defaultValue="1"
              onChange={e => setlatitudeTo(e.target.value)}
              value={latitudeTo}
            />
            <TextField
              required
              id="outlined-required"
              label="Longitude From"
              defaultValue="2"
              onChange={e => setlongitudeFrom(e.target.value)}
              value={longitudeFrom}
            />
            <TextField
              required
              id="outlined-required"
              label="Longitude To"
              defaultValue="3"
              onChange={e => setlongitudeTo(e.target.value)}
              value={longitudeTo}
            />
          </div>
        </Box>

        <Button
          style={{
            justifyContent: "center",
            marginLeft: "40%",
            marginTop: "5%",
            color: "green",
            fontSize: "20px",
            fontWeight: "bold",
          }}
          //variant="contained"
          onClick={() => {spatialRange(latitudeFrom, longitudeFrom, latitudeTo, longitudeTo)}}
        >
          Submit
        </Button>
        <Button
          style={{
            justifyContent: "center",
            marginLeft: "2%",
            marginTop: "5%",
            color: "red",
            fontSize: "20px",
            fontWeight: "bold",
          }}
          //variant="contained"
          onClick={() => {
            viewSpatial()
            .then(data => setTripsLayer(data))
            setOpenPopup1(false);
          }}
        >
          Exit
        </Button>
      </Popup1>

      {/* {POPUP 2} */}
      <Popup2 openPopup={openPopup2} setOpenPopup={setOpenPopup2}>
        <Typography variant="h4">SPATIAL TEMPORAL RANGE</Typography>
        <Typography>( "*" Required )</Typography>

        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": { m: 1, width: "25ch" },
          }}
          noValidate
          autoComplete="off"
        >
          <div>
            <TextField
              required
              id="outlined-required"
              label="Latitude From"
              defaultValue="0"
            />
            <TextField
              required
              id="outlined-required"
              label="Latitude To"
              defaultValue="1"
            />
            <TextField
              required
              id="outlined-required"
              label="Longitude From"
              defaultValue="2"
            />
            <TextField
              required
              id="outlined-required"
              label="Longitude To"
              defaultValue="3"
            />
            <TextField
              required
              id="outlined-required"
              label="TimeStamp From"
              defaultValue="2"
            />
            <TextField
              required
              id="outlined-required"
              label="TimeStamp To"
              defaultValue="3"
            />
          </div>
        </Box>
        <Button
          style={{
            justifyContent: "center",
            marginLeft: "40%",
            marginTop: "5%",
            color: "green",
            fontSize: "20px",
            fontWeight: "bold",
          }}
          //variant="contained"
          onClick={() => {spatialTemporalRange()}}
        >
          Submit
        </Button>
        <Button
          style={{
            justifyContent: "center",
            marginLeft: "2%",
            marginTop: "5%",
            color: "red",
            fontSize: "20px",
            fontWeight: "bold",
          }}
          //variant="contained"
          onClick={() => {
            setOpenPopup2(false);
          }}
        >
          Exit
        </Button>
      </Popup2>

      {/* {POPUP 3} */}
      <Popup3 openPopup={openPopup3} setOpenPopup={setOpenPopup3}>
        <Typography variant="h4">KNN</Typography>
        <Typography>( "*" required )</Typography>

        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": { m: 1, width: "25ch" },
          }}
          noValidate
          autoComplete="off"
        >
          <div>
            <TextField
              required
              id="outlined-required"
              label="Trajectory Id"
              defaultValue="0"
            />
            <TextField
              required
              id="outlined-required"
              label="K"
              defaultValue="1"
            />
          </div>
        </Box>

        <Button
          style={{
            justifyContent: "center",
            marginLeft: "30%",
            marginTop: "5%",
            color: "green",
            fontSize: "20px",
            fontWeight: "bold",
          }}
          //variant="contained"
          onClick={() => {Knn()}}
        >
          Submit
        </Button>
        <Button
          style={{
            justifyContent: "center",
            marginLeft: "2%",
            marginTop: "5%",
            color: "red",
            fontSize: "20px",
            fontWeight: "bold",
          }}
          //variant="contained"
          onClick={() => {
            setOpenPopup3(false);
          }}
        >
          Exit
        </Button>
      </Popup3>
    </React.Fragment>
  );
}

export default App;
