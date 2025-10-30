import { useLocation } from 'react-router-dom';
import '../styles/ModelResult.css';

const ModelResult = () => {
  const location = useLocation();
  const results = location.state?.results || [];  

  return (
    <div className="model-results-container">
      <h2>Model Results</h2>
      <div className="model-table-wrapper-container">
        <table className="model-result-table">
          <thead>
            <tr>
              <th>Message Text</th>
              <th>probably Antisemitic?</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.message_text}</td>
                <td>{result.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModelResult;
