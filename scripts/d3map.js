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
                data: null, // Bubble data: array of objects with { country, count, coordinates }
                geoData: null, // GeoJSON data for the map (not used in this Leaflet version)
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
            this.drawMapLibreMap();
            return this;
        }

        calculateProperties() {
            const {
                marginLeft,
                marginTop,
                marginRight,
                marginBottom,
                svgWidth,
                svgHeight
            } = this.getState();
            const calc = {
                chartLeftMargin: marginLeft,
                chartTopMargin: marginTop
            };
            const chartWidth = svgWidth - marginLeft - marginRight;
            const chartHeight = svgHeight - marginTop - marginBottom;
            this.setState({
                calc,
                chartWidth,
                chartHeight
            });
        }

        drawSvgAndWrappers() {
            const {
                d3Container,
                svgWidth,
                svgHeight,
                defaultFont,
                calc
            } = this.getState();
            // Draw main SVG container (for any additional D3 visualizations, if needed)
            const svg = d3Container._add('svg.svg-container')
                .attr("width", svgWidth)
                .attr("height", svgHeight)
                .attr("font-family", defaultFont);

            // Add a group for the chart area (shifted by margins)
            const chart = svg._add('g.chart')
                .attr("transform", `translate(${calc.chartLeftMargin},${calc.chartTopMargin})`);

          

            this.setState({
                svg,
                chart
            });
        }

        drawMapLibreMap() {
            const {
                container,
                mapCenter,
                zoomLevel
            } = this.getState();
            const realData = d3.csv('https://raw.githubusercontent.com/bumbeishvili/tech-survey-data/refs/heads/main/Georgian%20Tech%20Survey%20-%202023%20(Responses)%20-%20Form%20Responses%201.csv').then(realData => {

                const data = realData.map(d => {
                    return {
                        year: 2023,
                        sex: d.სქესი,
                        age: d.ასაკი,
                        experience: d[" სამუშაო გამოცდილება tech სფეროში"],
                        fromLearningToJobTime: d["თქვენს სფეროში სწავლის დაწყებიდან, რამდენ ხანში დაიწყეთ მუშაობა?"],
                        devType: d["რომელ კატეგორიას მიეკუთვნებით ყველაზე მეტად?"],
                        firstLanguage: d["რომელი ენით დაიწყეთ პროგრამირების სწავლა?"],
                        currentLanguge: d["რომელ პროგრამირების ენას იყენებთ  ამჟამად ძირითადად?"],
                        mainFramework: d[" რომელ framework-ს იყენებთ ძირითადად?"],
                        employmenType: d["დასაქმების ტიპი"],
                        workType: d[" სამუშაოს ტიპი"],
                        workLanguge: d["სამუშაო ენა"],
                        employerType: d["ძირითადი დამსაქმებელი ორგანიზაცის საქმიანობის სფერო "],
                        phyiscalLocation: d["ქვეყანა სადაც ფიზიკურად იმყოფებით"],
                        monthlyWage: d["საშუალო თვიური შემოსავალი ხელზე ლარებში ბოლო 1 წლის მანძილზე"],
                        mostWageCameFrom: d["ქვეყანა, საიდანაც ყველაზე მეტი შემოსავალი გაქვთ მიღებული  ბოლო ერთი წლის მანძილზე"],
                        satisfeidByWork: d["კმაყოფილი ხართ ახლანდელი სამუშაო ადგილით?"],
                        avarageWorkHourMonthly: d["17. საშუალოდ რამდენ საათს მუშაობთ თვეში (და არა კვირაში!) ?"],
                        educationLevel: d["განათლების დონე"],
                        gpa: d["თქვენი GPA უნივერსიტეტში (თუ სწავლობთ ან დამთავრებული გაქვთ)"],
                    }
                })



                d3.select(container).html('<div id="maplibre-map" style="width: 100%; height: 100%;"></div>');

                // Initialize MapLibre Map
                var map = new maplibregl.Map({
                    container: 'maplibre-map', // container id
                    maxZoom: 18,
                    minZoom: 0,
                    style: {
                        version: 8,
                        sources: {
                            'raster-tiles': {
                                type: 'raster',
                                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                                tileSize: 256,
                                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                            },
                        },
                        layers: [{
                            id: 'simple-tiles',
                            type: 'raster',
                            source: 'raster-tiles',
                            minzoom: 0,
                            maxzoom: 22,
                        }, ],
                    },
                    center: [-14.5, 30], // starting position
                    zoom: 2, // starting zoom
                });

                const groupedData = d3.groups(data, d =>
                    (d.mostWageCameFrom === "UK") ? 'გაერთიანებული სამეფო' :
                    (d.mostWageCameFrom === "Denmark") ? "დანია" :
                    (d.mostWageCameFrom === "Belarus") ? "ბელარუსი" :
                    (d.mostWageCameFrom === 'Thailand') ? "ტაილანდი" :
                    d.mostWageCameFrom
                );;

                // Bubble data
                const Bubbledata = [{
                        country: "Georgia",
                        count: 137,
                        coordinates: [44.7986, 41.7151]
                    },
                    {
                        country: "Czech Republic",
                        count: 1,
                        coordinates: [15.4721, 49.8175]
                    },
                    {
                        country: "United States",
                        count: 35,
                        coordinates: [-95.7129, 37.0902]
                    },
                    {
                        country: "Latvia",
                        count: 2,
                        coordinates: [24.6032, 56.8796]
                    },
                    {
                        country: "Germany",
                        count: 11,
                        coordinates: [10.4515, 51.1657]
                    },
                    {
                        country: "Denmark",
                        count: 2,
                        coordinates: [9.5018, 56.2639]
                    },
                    {
                        country: "Israel",
                        count: 9,
                        coordinates: [34.8516, 31.0461]
                    },
                    {
                        country: "Canada",
                        count: 4,
                        coordinates: [-106.3468, 56.1304]
                    },
                    {
                        country: "United Kingdom",
                        count: 6,
                        coordinates: [-3.4359, 55.3781]
                    },
                    {
                        country: "Spain",
                        count: 2,
                        coordinates: [-3.7038, 40.4168]
                    },
                    {
                        country: "Estonia",
                        count: 3,
                        coordinates: [25.0136, 58.5953]
                    },
                    {
                        country: "Switzerland",
                        count: 2,
                        coordinates: [8.2275, 46.8182]
                    },
                    {
                        country: "Poland",
                        count: 3,
                        coordinates: [19.1451, 51.9194]
                    },
                    {
                        country: "Belgium",
                        count: 1,
                        coordinates: [4.4699, 50.8503]
                    },
                    {
                        country: "Turkey",
                        count: 1,
                        coordinates: [35.2433, 38.9637]
                    },
                    {
                        country: "France",
                        count: 3,
                        coordinates: [2.2137, 46.2276]
                    },
                    {
                        country: "United Kingdom",
                        count: 1,
                        coordinates: [-3.4359, 55.3781]
                    },
                    {
                        country: "Lithuania",
                        count: 1,
                        coordinates: [23.8813, 55.1694]
                    },
                    {
                        country: "Britain",
                        count: 3,
                        coordinates: [-3.4359, 55.3781]
                    },
                    {
                        country: "Austria",
                        count: 1,
                        coordinates: [16.3730, 48.2082]
                    },
                    {
                        country: "Thailand",
                        count: 1,
                        coordinates: [100.9925, 15.8700]
                    },
                    {
                        country: "Netherlands",
                        count: 1,
                        coordinates: [5.2913, 52.1326]
                    },
                    {
                        country: "Italy",
                        count: 1,
                        coordinates: [12.5674, 41.8719]
                    },
                    {
                        country: "Belarus",
                        count: 1,
                        coordinates: [27.9534, 53.7098]
                    },
                    {
                        country: "Ukraine",
                        count: 1,
                        coordinates: [31.1656, 48.3794]
                    }
                ]



                const filteredGrouped = groupedData.filter(([key]) => key !== '' && key !== "არ ვარ დასაქმებული");
                map.on('load', () => {
                    map.addSource('bubbles', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: Bubbledata.map(d => ({
                                type: 'Feature',
                                properties: {
                                    country: d.country,
                                    count: d.count
                                },
                                geometry: {
                                    type: 'Point',
                                    coordinates: d.coordinates
                                }
                            }))
                        }
                    });



                    // Add Circle Layer for Bubbles
                    map.addLayer({
                        id: 'bubble-layer',
                        type: 'circle',
                        source: 'bubbles',
                        paint: {
                            'circle-radius': ['interpolate', ['linear'],
                                ['get', 'count'], 1, 20, 100, 40
                            ],
                            'circle-color': [
                                'interpolate', ['linear'],
                                ['get', 'count'], 1, '#1E3A8A', 5, '#22C55E'
                            ],
                            'circle-opacity': 0,
                            'circle-stroke-width': 1,
                            'circle-stroke-color': 'gray'
                        }
                    });
                    let opacity = 0; // Start opacity at 0


                    function animateBubbles() {
                        // Gradually increase opacity and radius
                        if (opacity < 0.7) opacity += 0.007;
                        // Update circle opacity and radius
                        map.setPaintProperty('bubble-layer', 'circle-opacity', opacity);
                        // Request the next frame for the animation
                        if (opacity < 1) {
                            requestAnimationFrame(animateBubbles);
                        }
                    }

                    // Start the animation
                    animateBubbles();


                    // Add Popup on Click
                    map.on('click', 'bubble-layer', (e) => {
                        const coordinates = e.features[0].geometry.coordinates.slice();
                        const {
                            country,
                            count
                        } = e.features[0].properties;
                        new maplibregl.Popup()
                            .setLngLat(coordinates)
                            .setHTML(`<div style="padding: 2px;"> 
                                
                                <div>Country: ${country} </div>
                                <div>Amount of Votes: ${count} </div>
                                
                                </div>`)
                            .addTo(map);
                    });

                    // Change cursor on hover
                    map.on('mouseenter', 'bubble-layer', () => map.getCanvas().style.cursor = 'pointer');
                    map.on('mouseleave', 'bubble-layer', () => map.getCanvas().style.cursor = '');
                });


                this.setState({
                    map
                });
            })


        }



        initializeEnterExitUpdatePattern() {
            d3.selection.prototype._add = function (classSelector, data, params) {
                const container = this;
                const split = classSelector.split(".");
                const elementTag = split[0];
                const className = split[1] || 'not-good';
                const exitTransition = params ?.exitTransition;
                const enterTransition = params ?.enterTransition;

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
            this.setState({
                d3Container
            });
        }
    }