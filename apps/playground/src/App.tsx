import BasicTree from './examples/BasicTree';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', color: '#1c1c1c' }}>
      <h1 style={{ marginBottom: 16 }}>Hierarchy Graph Playground</h1>
      <BasicTree />
    </div>
  );
}
