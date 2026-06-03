# 🚀 NexusCore Systems - Plataforma de Optimización Logística y Talento

![NexusCore Systems Logo](https://img.shields.io/badge/Status-Completado-success?style=for-the-badge) ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white) ![SciPy](https://img.shields.io/badge/SciPy-8CAAE6?style=for-the-badge&logo=scipy&logoColor=white)

**NexusCore Systems** es una aplicación web interactiva y avanzada desarrollada como Proyecto Final Universitario de Programación Matemática. El sistema resuelve en tiempo real problemas complejos de investigación de operaciones, integrando algoritmos matemáticos tradicionales con un análisis estratégico gerencial en la nube.

## 📋 Características Principales

### 📦 Módulo I: Optimización Logística (Modelo de Transporte)
- Creación dinámica de matrices interactivas ($m \times n$).
- Validación en tiempo real del balance de la matriz (Oferta vs. Demanda).
- Creación automática de variables ficticias (nodos de costo cero) en caso de desbalanceo.
- Solución óptima para minimizar costos de distribución utilizando programación lineal (`scipy.optimize.linprog`).

### 👥 Módulo II: Gestión de Talento (Método Húngaro)
- Cuadrícula parametrizable ($N \times N$) para asignación de ingenieros a módulos de software.
- Ejecución desglosada y visual: Muestra **paso a paso** el progreso algorítmico del Método Húngaro (Reducción de filas, reducción de columnas, cobertura de ceros, y asignación final).
- Interfaz gráfica que dibuja las "líneas de cobertura" sobre las celdas automáticamente.

### 🧠 Módulo III: Análisis Estratégico (Integración Cloud)
- Generación de informes dinámicos estructurados actuando como Director de Operaciones (COO).
- Análisis profundo que incluye: impacto operacional, cuellos de botella, riesgos logísticos y evaluación de carga de trabajo basado directamente en los resultados matemáticos en tiempo real.

### 📄 Exportación Nivel Ejecutivo
- Generación nativa de **Reportes PDF** utilizando tecnología de vectores de texto.
- El reporte consolida de manera formal las matrices de entrada, los costos óptimos resueltos y el análisis estratégico textual con membrete corporativo.

## 🛠️ Stack Tecnológico

- **Backend:** Python 3, Flask (Framework REST).
- **Matemáticas y Algoritmia:** `numpy`, `scipy`.
- **Integración:** SDK de servicios Cloud para reportes de texto generativo (`groq`).
- **Frontend:** HTML5, CSS3, JavaScript (ES6+).
- **Estilos:** Diseño UI/UX "Dark Premium", Glassmorphism, Google Fonts (*Outfit* y *Plus Jakarta Sans*).
- **Exportación a PDF:** `jspdf`, `jspdf-autotable`.

## ⚙️ Instalación y Uso

Sigue estos pasos para correr el proyecto localmente en tu máquina:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/TU-USUARIO/nexuscore-systems.git
   cd nexuscore-systems
   ```

2. **Crear y activar un entorno virtual (Recomendado):**
   ```bash
   python -m venv venv
   
   # En Windows:
   venv\Scripts\activate
   
   # En macOS/Linux:
   source venv/bin/activate
   ```

3. **Instalar dependencias:**
   ```bash
   pip install flask scipy numpy groq
   ```

4. **Ejecutar el Servidor:**
   ```bash
   python app.py
   ```

5. **Acceder a la aplicación:**
   Abre tu navegador web y dirígete a: `http://127.0.0.1:5000`

## 🔑 Uso del Módulo Analítico
Para que el Módulo III de Análisis Estratégico funcione, el usuario deberá introducir en la interfaz la **Clave de Acceso** autorizada. Esta clave se comunica a nivel de servidor de manera segura para procesar el reporte de la matriz actual.

---
**Desarrollo:** Argenis  
*Proyecto de Programación Matemática - 2026*
