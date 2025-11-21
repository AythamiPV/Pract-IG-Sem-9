import * as THREE from "three";

export const ShaderManager = {
  atmosphereShader: {
    vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
    fragmentShader: `
            uniform vec3 glowColor;
            uniform float intensity;
            uniform float fresnelPower;
            
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            
            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                
                float fresnel = pow(1.0 - dot(normal, viewDir), fresnelPower);
                fresnel = clamp(fresnel, 0.0, 1.0);
                
                vec3 atmosphere = glowColor * fresnel * intensity;
                
                gl_FragColor = vec4(atmosphere, fresnel * 0.6);
            }
        `,
    uniforms: {
      glowColor: { value: new THREE.Color(0.4, 0.6, 1.0) },
      intensity: { value: 2.0 },
      fresnelPower: { value: 3.0 },
    },
  },
  solarFlaresShader: {
    vertexShader: `
        uniform float time;
        attribute float size;
        attribute float speed;
        attribute float offset;
        attribute float activation; 
        
        varying float vActivation;
        varying float vSize;
        
        void main() {
            vActivation = activation;
            vSize = size;
            
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            
            gl_PointSize = size * 12.0;
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec3 flareColor;
        
        varying float vActivation;
        varying float vSize;
        
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
            
            vec2 coord = gl_PointCoord - vec2(0.5);
            float dist = length(coord);
            
            
            if (dist > 0.5) discard;
            float cycleTime = 4.0; 
            float activeTime = fract((time + vActivation * 10.0) / cycleTime);
            
            float isActive = 0.0;
            if (activeTime < 0.3) { 
                if (activeTime < 0.1) {
                    isActive = activeTime / 0.1; 
                } else if (activeTime < 0.2) {
                    isActive = 1.0; 
                } else {
                    isActive = 1.0 - (activeTime - 0.2) / 0.1; 
                }
            }
            
            if (isActive <= 0.0) discard;
            
            float centerIntensity = 1.0 - smoothstep(0.0, 0.5, dist);
            centerIntensity = pow(centerIntensity, 2.0);
            
            float edgeIntensity = 1.0 - smoothstep(0.3, 0.5, dist);
            
            float intensity = centerIntensity * edgeIntensity;
            
            float particleRandom = random(vec2(vActivation, vSize));
            float randomVariation = 0.7 + particleRandom * 0.6; 
            
            float pulse = sin(time * 8.0 + vActivation * 20.0) * 0.2 + 0.8;
            
            vec3 color = flareColor * intensity * isActive * randomVariation * pulse;
            float alpha = intensity * isActive * 0.9;
            
            gl_FragColor = vec4(color, alpha);
        }
    `,
    uniforms: {
      time: { value: 0.0 },
      flareColor: { value: new THREE.Color(1.0, 0.6, 0.3) },
    },
  },
  cometTailShader: {
    vertexShader: `
        attribute float size;
        attribute float alpha;
        attribute float progress;
        
        varying float vAlpha;
        varying float vProgress;
        
        void main() {
            vAlpha = alpha;
            vProgress = progress;
            
            vec3 pos = position;
          
            float coreSize = 0.08;
            float widthMultiplier = progress * 15.0 * coreSize;
            float lengthMultiplier = 80.0 * coreSize;
            
            pos.xy *= widthMultiplier;
            pos.z = -progress * lengthMultiplier;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * 3.0 * coreSize * (1.0 + progress * 0.3);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform float distanceToSun;
        uniform vec3 tailColor;
        uniform float tailVisibility;
        uniform float tailBrightness; 
        
        varying float vAlpha;
        varying float vProgress;
        
        void main() {
            if (tailVisibility <= 0.0) discard;
            
            vec2 coord = gl_PointCoord - vec2(0.5);
            float dist = length(coord);
            
            if (dist > 0.5) discard;
            
            float sunInfluence = 1.0 - clamp(distanceToSun / 25.0, 0.0, 1.0);
            float brightness = 1.0 + sunInfluence * 6.0; 
            
            float movement = sin(time * 5.0 + vProgress * 40.0) * (1.0 - vProgress) * 0.4 + 0.6;
            
            float baseAlpha = vAlpha * (1.0 - vProgress * 0.8) * movement;
            float particleAlpha = baseAlpha * tailVisibility * (0.8 + sunInfluence * 0.4);
            
            float extraBrightness = 1.0 + tailVisibility * 2.0; 
            
            vec3 baseColor = tailColor * brightness * extraBrightness * tailBrightness;
            
            float centerGlow = 1.0 - smoothstep(0.0, 0.3, dist);
            vec3 glowColor = mix(baseColor, vec3(1.0, 1.0, 1.2), centerGlow * 0.3);
            
            float intensity = (1.0 - dist * 2.0);
            intensity = pow(intensity, 1.5); 
            
            vec3 finalColor = glowColor * intensity;
            if (tailVisibility > 0.5) {
                particleAlpha *= 1.2;
            }
            
            gl_FragColor = vec4(finalColor, particleAlpha);
        }
    `,
    uniforms: {
      time: { value: 0.0 },
      distanceToSun: { value: 100.0 },
      tailColor: { value: new THREE.Color(0.8, 0.9, 1.2) },
      tailVisibility: { value: 0.0 },
      tailBrightness: { value: 1.5 },
    },
  },
};

export function applyShaders(scene, clock) {
  const shaderObjects = [];
  scene.traverse((object) => {
    if (object.userData && object.userData.shaderUniforms) {
      shaderObjects.push(object);
    }
  });

  function updateShaders() {
    const elapsedTime = clock.getElapsedTime();

    shaderObjects.forEach((obj) => {
      if (obj.userData.shaderUniforms && obj.userData.shaderUniforms.time) {
        obj.userData.shaderUniforms.time.value = elapsedTime;
      }
      if (
        obj.userData &&
        obj.userData.isComet &&
        obj.userData.shaderUniforms &&
        obj.userData.shaderUniforms.distanceToSun
      ) {
        const distance = obj.position.length();
        obj.userData.shaderUniforms.distanceToSun.value = distance;
      }
    });
  }

  return {
    updateShaders,
    shaderObjects,
  };
}
export function createAtmosphereMaterial(planetRadius, color = null) {
  const material = new THREE.ShaderMaterial({
    vertexShader: ShaderManager.atmosphereShader.vertexShader,
    fragmentShader: ShaderManager.atmosphereShader.fragmentShader,
    uniforms: THREE.UniformsUtils.clone(
      ShaderManager.atmosphereShader.uniforms
    ),
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });

  if (color) {
    material.uniforms.glowColor.value = color;
  }

  return material;
}

export function createSolarFlares(sunRadius) {
  const particleCount = 60;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const speeds = new Float32Array(particleCount);
  const offsets = new Float32Array(particleCount);
  const activations = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = Math.sin(phi) * Math.cos(theta) * sunRadius * 1.01;
    const y = Math.sin(phi) * Math.sin(theta) * sunRadius * 1.01;
    const z = Math.cos(phi) * sunRadius * 1.01;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    const baseSize = 1.5;
    const sizeVariation = 0.8;
    sizes[i] = baseSize + Math.random() * sizeVariation;
    speeds[i] = Math.random() * 2.0 + 1.0;
    offsets[i] = Math.random() * Math.PI * 2;
    activations[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("speed", new THREE.BufferAttribute(speeds, 1));
  geometry.setAttribute("offset", new THREE.BufferAttribute(offsets, 1));
  geometry.setAttribute(
    "activation",
    new THREE.BufferAttribute(activations, 1)
  );

  const material = new THREE.ShaderMaterial({
    vertexShader: ShaderManager.solarFlaresShader.vertexShader,
    fragmentShader: ShaderManager.solarFlaresShader.fragmentShader,
    uniforms: THREE.UniformsUtils.clone(
      ShaderManager.solarFlaresShader.uniforms
    ),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const flares = new THREE.Points(geometry, material);
  return flares;
}

export function createComet() {
  const coreSize = 0.08;
  const coreGeometry = new THREE.SphereGeometry(coreSize, 12, 12);
  const coreMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0x444444,
    emissiveIntensity: 0.3,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  const particleCount = 500;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const alphas = new Float32Array(particleCount);
  const progresses = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const progress = Math.random();
    const maxRadius = progress * 1.2;
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random()) * maxRadius;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = 0;
    sizes[i] = Math.random() * 1.0 + 0.3 + progress * 0.7;
    alphas[i] = (1.0 - progress * 0.6) * (Math.random() * 0.8 + 0.4);
    progresses[i] = progress;
  }

  const tailGeometry = new THREE.BufferGeometry();
  tailGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  tailGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  tailGeometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));
  tailGeometry.setAttribute(
    "progress",
    new THREE.BufferAttribute(progresses, 1)
  );

  const tailMaterial = new THREE.ShaderMaterial({
    vertexShader: ShaderManager.cometTailShader.vertexShader,
    fragmentShader: ShaderManager.cometTailShader.fragmentShader,
    uniforms: THREE.UniformsUtils.clone(ShaderManager.cometTailShader.uniforms),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const tail = new THREE.Points(tailGeometry, tailMaterial);
  const cometGroup = new THREE.Group();
  cometGroup.add(core);
  cometGroup.add(tail);
  cometGroup.userData = {
    isComet: true,
    semiMajorAxis: 70,
    eccentricity: 0.85,
    inclination: THREE.MathUtils.degToRad(18),
    angle: Math.PI * 0.7,
    speed: 0.003,
    shaderUniforms: tailMaterial.uniforms,
    coreSize: coreSize,
  };

  return cometGroup;
}
