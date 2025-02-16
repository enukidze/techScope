class ChartMap {
    constructor() {
      // Define initial state attributes
      const attrs = {
        id: "ID" + Math.floor(Math.random() * 1000000),
        svgWidth: 800,
        svgHeight: 600,
        marginTop: 10,
        marginBottom: 10,
        marginRight: 10,
        marginLeft: 10,
        container: "#map-container", // CSS selector for the container element
        defaultFont: "Helvetica",
        data: null,       // Bubble data: array of objects with { country, count, coordinates }
        geoData: null,    // GeoJSON data for the map (not used in this Leaflet version)
        chartWidth: null,
        chartHeight: null,
        // Set the map center and zoom to show a global view
        mapCenter: [20, 0], // [latitude, longitude]
        zoomLevel: 2
      };
  
      // State accessors
      this.getState = () => attrs;
      this.setState = (d) => Object.assign(attrs, d);
  
      // Auto-generate getter/setters for state properties
      Object.keys(attrs).forEach((key) => {
        this[key] = function (_) {
          if (!arguments.length) return attrs[key];
          attrs[key] = _;
          return this;
        };
      });
  
      // Initialize custom enter/exit/update pattern (for D3 SVG usage)
      this.initializeEnterExitUpdatePattern();
    }
  
    render() {
      this.setDynamicContainer();
      this.calculateProperties();
      this.drawSvgAndWrappers();
      this.drawLeafletMap();
      return this;
    }
  
    calculateProperties() {
      const { marginLeft, marginTop, marginRight, marginBottom, svgWidth, svgHeight } = this.getState();
      const calc = {
        chartLeftMargin: marginLeft,
        chartTopMargin: marginTop
      };
      const chartWidth = svgWidth - marginLeft - marginRight;
      const chartHeight = svgHeight - marginTop - marginBottom;
      this.setState({ calc, chartWidth, chartHeight });
    }
  
    drawSvgAndWrappers() {
      const { d3Container, svgWidth, svgHeight, defaultFont, calc } = this.getState();
      // Draw main SVG container (for any additional D3 visualizations, if needed)
      const svg = d3Container._add('svg.svg-container')
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("font-family", defaultFont);
  
      // Add a group for the chart area (shifted by margins)
      const chart = svg._add('g.chart')
        .attr("transform", `translate(${calc.chartLeftMargin},${calc.chartTopMargin})`);
  
      this.setState({ svg, chart });
    }
  
    drawLeafletMap() {
      const { container, mapCenter, zoomLevel, data } = this.getState();
  
      // Create a Leaflet container div inside the container element
      d3.select(container).html('<div id="leaflet-map" style="width: 100%; height: 500px;"></div>');
  
      // Initialize the Leaflet map
      const map = L.map("leaflet-map").setView(mapCenter, zoomLevel);
  
      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(map);
  
      // Create a custom pane for bubble markers so they appear on top
      map.createPane('bubblePane');
      map.getPane('bubblePane').style.zIndex = 650; // High z-index ensures bubbles are on top
  
      // If bubble data exists, add circle markers for each data point
      if (data && data.length) {
        data.forEach(d => {
          L.circleMarker(d.coordinates, {
            pane: 'bubblePane',             // Ensure this marker uses the custom pane
            radius: Math.sqrt(d.count) * 2,   // Scale bubble size; adjust multiplier as needed
            color: "blue",
            fillColor: "blue",
            fillOpacity: 0.5
          }).addTo(map)
            .bindPopup(`<b>${d.country}</b><br>Count: ${d.count}`);
        });
      }
  
      this.setState({ map });
    }
  
    initializeEnterExitUpdatePattern() {
      d3.selection.prototype._add = function (classSelector, data, params) {
        const container = this;
        const split = classSelector.split(".");
        const elementTag = split[0];
        const className = split[1] || 'not-good';
        const exitTransition = params?.exitTransition;
        const enterTransition = params?.enterTransition;
  
        let bindData = data;
        if (typeof data === 'function') {
          bindData = data(container.datum());
        }
        if (bindData && !Array.isArray(bindData)) {
          bindData = [bindData];
        }
        if (!bindData) {
          if (container.datum()) {
            bindData = d => [d];
          } else {
            bindData = [className];
          }
        }
  
        let selection = container.selectAll(elementTag + '.' + className).data(bindData, (d, i) => {
          if (typeof d === "object" && d.id) return d.id;
          return i;
        });
        if (exitTransition) {
          exitTransition(selection);
        } else {
          selection.exit().remove();
        }
        const enterSelection = selection.enter().append(elementTag);
        if (enterTransition) {
          enterTransition(enterSelection);
        }
        selection = enterSelection.merge(selection);
        selection.attr("class", className);
        if (className === 'not-good') {
          selection.attr('stroke', 'red')
            .attr('stroke-width', 10);
          selection.selectAll('title').data(['not-good']).join('title')
            .text("You don't have a class set for this element!");
        }
        return selection;
      };
    }
  
    setDynamicContainer() {
      const attrs = this.getState();
      // Select the container element using D3
      const d3Container = d3.select(attrs.container);
      const containerRect = d3Container.node().getBoundingClientRect();
      if (containerRect.width > 0) attrs.svgWidth = containerRect.width;
      // Removed window resize event to prevent re-rendering the map repeatedly
      this.setState({ d3Container });
    }
  }
  
  // Example dataset with several bubble markers
  const data = [
    { country: "France", count: 200, coordinates: [46.2276, 2.2137] },
    { country: "USA", count: 300, coordinates: [37.0902, -95.7129] },
    { country: "Australia", count: 150, coordinates: [-25.2744, 133.7751] },
    { country: "Japan", count: 250, coordinates: [36.2048, 138.2529] },
    { country: "Brazil", count: 100, coordinates: [-14.2350, -51.9253] }
  ];
  
  // Instantiate and render the ChartMap with Leaflet integration
  const bubbleMap = new ChartMap()
    .container("#map-container")
    .data(data)
    .render();
  