// consulta.mjs
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import https from 'https';

const app = express();
const PORT = 3000;

let totalConsultas = 0;
let consultasActivas = 0;

app.use(cors());
app.use(express.json());

const agent = new https.Agent({ rejectUnauthorized: false });

app.post('/api/dni', async (req, res) => {
  const { dni } = req.body;

  if (!dni || !/^[0-9]{8}$/.test(dni)) {
    console.log('❌ DNI inválido recibido.');
    return res.status(400).json({ error: 'DNI inválido' });
  }

  consultasActivas++;
  totalConsultas++;
  console.log(`🔍 Consultando DNI: ${dni} | Activas: ${consultasActivas} | Total: ${totalConsultas}`);

  const apiKey = 'dtXWO2ZdJQabDwM4RabfahVN3gwpSA8V';
  const user = 'admin@example.com';
  const url = `https://xdataperu.com/api/reniec/${dni}?api_key=${apiKey}&user=${user}`;

  try {
    const response = await fetch(url, { agent });
    const result = await response.json();

    consultasActivas--;

    if (!result.success || !result.data || !result.data.persona) {
      console.log(`⚠️ No se encontraron datos para el DNI: ${dni}`);
      return res.status(404).json({ error: 'No se encontraron datos para este DNI' });
    }

    const p = result.data.persona;
    const d = result.data.domicilio;
    const n = result.data.nacimiento;

    console.log(`✅ Respuesta enviada para DNI ${dni}`);

    res.json({
      dni: p.dni,
      nombres: p.nombres,
      apellido_paterno: p.apellido_paterno,
      apellido_materno: p.apellido_materno,
      sexo: p.sexo,
      estado_civil: p.estado_civil,
      estatura: p.estatura,
      fecha_nacimiento: p.fecha_nacimiento,
      fecha_emision: p.fecha_emision,
      fecha_caducidad: p.fecha_caducidad,
      nombre_padre: p.nombre_padre,
      nombre_madre: p.nombre_madre,
      grado_instruccion: p.grado_instruccion,
      direccion: d.direccion,
      distrito: d.distrito,
      provincia: d.provincia,
      departamento: d.departamento,
      restriccion: d.restriccion,
      departamento_nacimiento: n.departamento,
      provincia_nacimiento: n.provincia,
      distrito_nacimiento: n.distrito,
      dona_organos: p.dona_organos || 'NO',
      foto_base64: p.foto_base64
    });
  } catch (error) {
    consultasActivas--;
    console.error('❌ Error al consultar API:', error.message);
    res.status(500).json({ error: 'Error al conectar con el servicio de RENIEC' });
  }
});

// ✅ CAMBIO CLAVE AQUÍ
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor iniciado en http://0.0.0.0:${PORT}`);
  console.log('🌐 Navegando listo para recibir consultas.');
});

