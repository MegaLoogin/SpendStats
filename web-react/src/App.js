import { PublicStats } from "./PublicStats.js";
import { SendForm } from "./SendForm.js";
import { Stats } from "./Stats.js";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export const LOCAL_KEY = "0066cec078e744518b28eefddd56ef08", PUBLIC_KEY = "657adc2660b848d7b53ffc029b9ea21d";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route path={LOCAL_KEY + "/sendForm"} element={<SendForm/>}/>
            <Route path={LOCAL_KEY + "/stats"} element={<Stats/>}/>
            <Route path={PUBLIC_KEY + "/stats"} element={<PublicStats/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
