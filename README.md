# NASWeb

Web application to automatically search for optimized neural architectures for semantic segmentation, using bio-inspired algorithms and a visual interface to configure, execute, and evaluate searches.

NASWeb is the frontend layer of the system: it provides a web interface to define search parameters, start optimization processes, visualize results in real-time, and train the selected architecture. Communication with the search engine is done through an external backend that exposes search, training, and artifact download APIs.

## Table of Contents

- [Project Description](#project-description)
- [Key Features](#key-features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Execution](#execution)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Workflow](#workflow)
- [Project API](#project-api)
- [Screenshots](#screenshots)
- [Important Notes](#important-notes)
- [Authors](#authors)

## Project Description

This project is designed to facilitate the search for optimized U-Net architectures for segmentation tasks. Instead of manually designing architectures, users can:

- Select the dataset to explore
- Choose a search algorithm
- Adjust evolutionary parameters
- Run the optimization from the web
- Review performance metrics (IoU and fitness)
- Download the generated architecture
- Train the best architecture found

The interface is built with Express + EJS and a client-side JavaScript layer that consumes various endpoints from the NAS backend.

## Key Features

1. Visual architecture search
   - Define the dataset to explore
   - Choose between search algorithms like Differential Evolution or Genetic Algorithm
   - Adjust population size, generations, crossover rate, mutation rate, and F

2. Real-time results
   - The app consumes the backend API via streaming
   - Displays information such as estimated IoU, fitness, number of parameters, generation, time, and stopping reason

3. Artifact download
   - Download the architecture in JSON format
   - Download the model in .pkl format

4. Training of the selected architecture
   - Load a previously generated JSON architecture
   - Define dataset size, epochs, and dataset
   - Send the configuration to the backend to train the network and visualize metrics

5. Modern graphical interface
   - Bootstrap for layout
   - Visual effects with Vanta.js and Anime.js
   - Client-side notifications with Notiflix

## Technologies Used

- Node.js
- Express.js
- EJS
- Bootstrap
- Anime.js
- Leader-line
- Notiflix
- Undici
- Jest
- JSDoc

## Prerequisites

Before running the project, make sure you have installed:

- Node.js >= 18
- npm >= 9
- Internet access to consume the external backend API
- A functional NAS backend that exposes the expected endpoints

## Installation

```bash
# Clone the repository
git clone git@github.com:TT-NAS/NASWeb.git

# Navigate to the project
cd NASWeb

# Install dependencies
npm install
```

## Execution

### Development mode

```bash
npm run dev
```

### Production mode

```bash
npm start
```

The application will be available at:

```text
http://localhost:3000/
```

The main interface can be opened from the route:

```text
http://localhost:3000/start
```

## Environment Variables

Although the project uses default values in the code, it is recommended to define a `.env` file with the environment configuration.

```ini
PORT=3000
API_URL=http://35.209.225.231/:8000
LOG_LEVEL=dev
```

> Note: In the current implementation, the backend URL is configured directly in the `controllers/logic.js` file, so if the service changes location, that value should be updated or configured via an appropriate environment.

## Available Scripts

```bash
npm run dev
npm start
npm test
npm run docs
```

### Description

- `npm run dev`: Starts the app with nodemon for development
- `npm start`: Starts the application without automatic restart
- `npm test`: Runs unit tests with Jest
- `npm run docs`: Generates documentation with JSDoc

## Project Structure

```text
NASWeb/
├─ index.js                    # Main entry point of the Express application
├─ package.json                # Project dependencies and scripts
├─ jsdoc.json                  # Configuration for JSDoc documentation
├─ README.md                   # Project documentation
├─ controllers/
│  ├─ logic.js                 # Logic for integration with the backend API
│  └─ validationData.js        # Validation of input payloads
├─ routes/
│  └─ router.js                # Definition of HTTP routes
├─ public/
│  ├─ css/
│  │  ├─ animation.css
│  │  └─ index.css
│  ├─ img/
│  └─ js/
│     ├─ start.animation.fluid.js
│     ├─ start.animation.js
│     ├─ start.form.js
│     └─ start.validation.js
├─ views/
│  ├─ home.ejs
│  ├─ start.ejs
│  ├─ error.ejs
│  └─ partials/
│     ├─ _header.ejs
│     ├─ _nav.ejs
│     ├─ _footer.ejs
│     └─ _unet_animation.ejs
├─ test/
│  ├─ validation.public.test.js
│  ├─ validationData.test.js
│  └─ start.form.public.test.js
├─ docs/
│  └─ documentation generated by JSDoc
└─ public/files/redes/         # Sample network JSON files
```

## Workflow

1. User accesses the main view or search view
2. Configures search parameters (dataset, algorithm, population, generations, etc.)
3. The interface makes a POST request to `/api/search`
4. The NAS backend processes the search and returns streaming with metrics and partial results
5. The client updates IoU, fitness, generation, and parameter values
6. The user can download the model or convert the best architecture to JSON
7. The selected architecture can be loaded for training
8. The app sends the configuration to `/api/train` and observes training metrics in real-time

## Project API

The application exposes several routes to consume the logic of the NAS backend.

| Method | Route                         | Description                                                  |
| ------ | ----------------------------- | ------------------------------------------------------------ |
| GET    | `/`                           | Application main information page                            |
| GET    | `/start`                      | Main search and training view                                |
| POST   | `/api/search`                 | Executes architecture search using form parameters           |
| POST   | `/api/train`                  | Trains the selected architecture with the configured dataset |
| POST   | `/api/json`                   | Converts the chromosome to JSON format                       |
| POST   | `/api/download/pkl`           | Downloads the generated model in .pkl format                 |
| GET    | `/api/download/pkl-url/:name` | Downloads a model by name from the backend                   |
| GET    | `/api/download/image`         | Gets a training result image                                 |

### Usage Example

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "n_pop": 25,
    "f": 0.5,
    "crossover_rate": 0.9,
    "mutation_rate": 0.01,
    "max_gen": 50
  }'
```

## Research

Designing convolutional neural network (CNN) architectures for semantic segmentation is often expert-dependent. This work presents a neural architecture search (NAS) prototype that democratizes architecture design through evolutionary computation. The framework employs a dual-representation search space and a surrogate performance estimator to identify high-performing U-Net variants without the prohibitive cost of full training. A graphical user interface improves search transparency and user interaction. Testing on the Carvana and a custom road dataset shows that our automated approach consistently produces architectures that outperform the U-Net baseline, balancing IoU and model size. This prototype offers an accessible and transparent solution for researchers to generate efficient, task-specific segmentation models autonomously.

Related Paper: [An Evolutionary Neural Architecture Search Approach with Visual Interfacing Prototype for Semantic Image Segmentation | Proceedings of the Genetic and Evolutionary Computation Conference Companion](https://dl.acm.org/doi/10.1145/3795101.3805393)

## Screenshots

### Architecture Search

![Search Configuration](https://github.com/user-attachments/assets/e602399c-02c4-422a-96a6-5eac5ac1277e)

### Search Execution

![Architecture Search](https://github.com/user-attachments/assets/c4a86e86-29fa-4bf3-9602-3726e668dde5)

### Training the Selected Architecture

![Architecture Training](https://github.com/user-attachments/assets/08b6cf1e-eb20-420e-be3f-1bb9e9b54fb4)

## Important Notes

- The application functions as a web client of a NAS backend; without the external API, it cannot execute real searches
- The `controllers/logic.js` file contains the backend base URL and is the key point for adjusting connections in different environments
- Payload validation is performed with `controllers/validationData.js` to avoid communication errors with the backend
- The documentation generated with JSDoc is located in the `docs/` folder

## Authors

- Kevin Uriel Manzano Ríos
- Kevin Jafet Morán Orozco
- Jaime Núñez Castillo

---

This README is designed so that anyone can install, run, and understand the logic of NASWeb without needing to review the entire source code.
