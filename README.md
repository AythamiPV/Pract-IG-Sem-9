
# Sistema Solar 3D - Shaders Personalizados

Este módulo contiene los **shaders personalizados** para el Sistema Solar 3D Interactivo, diseñados para mejorar visualmente la experiencia con efectos atmosféricos realistas, fenómenos solares dinámicos y colas de cometas físicas.

---

##  Integración en el Proyecto

### Estructura de Archivos
src/

├── shaders.js # Módulo principal de shaders

└── script.js # Lógica principal (integración)

textures/ # Texturas utilizadas en el proyecto


---

##  Efectos Visuales Implementados

**Para el Sol:**
- Erupciones superficiales aleatorias.
- Ciclos de actividad independientes por partícula.
- Brillo pulsante durante los periodos activos.

**Para Planetas con Atmósfera:**
- Efecto de dispersión de luz en los bordes.
- Glow intensificado en el limbo.
- Colores personalizados según composición atmosférica.

**Para el Cometa Halley:**
- Cola de partículas intensificada cerca del Sol.
- Brillo dinámico basado en la distancia solar.
- Núcleo brillante con emisividad variable.
- Órbita elíptica realista con inclinación.

---

##  Optimizaciones de Rendimiento
- Uso de **ShaderMaterials** en lugar de materiales estándar.
- **BufferGeometry** para manejo óptimo de partículas.
- **Additive Blending** para glow sin coste adicional.
- **Depth Write desactivado** en transparencias para evitar artifacts.
- **Culling inteligente** de partículas no visibles.

---

##  Tecnologías
- **Three.js** para renderizado WebGL 3D.
- Shaders personalizados en GLSL.
- Partículas y efectos dinámicos optimizados para rendimiento en tiempo real.

---

## Enlaces
. [codesanbox](https://codesandbox.io/p/sandbox/ig2526-s9-jtv227)
---

