'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060010);
    scene.fog = new THREE.FogExp2(0x060010, 0.012);

    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 55);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // --- Distant star field ---
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(3000 * 3);
    for (let i = 0; i < starPos.length; i++) {
      starPos[i] = (Math.random() - 0.5) * 400;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0x9f7aea, size: 0.15, transparent: true, opacity: 0.5 })
    );
    scene.add(stars);

    // --- Closer particle cluster ---
    const clusterCount = 600;
    const clusterPos = new Float32Array(clusterCount * 3);
    const clusterColors = new Float32Array(clusterCount * 3);
    for (let i = 0; i < clusterCount; i++) {
      const radius = 15 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      clusterPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      clusterPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      clusterPos[i * 3 + 2] = radius * Math.cos(phi);
      const t = Math.random();
      clusterColors[i * 3] = 0.3 + t * 0.4;
      clusterColors[i * 3 + 1] = 0.05 + t * 0.15;
      clusterColors[i * 3 + 2] = 0.8 + t * 0.2;
    }
    const clusterGeo = new THREE.BufferGeometry();
    clusterGeo.setAttribute('position', new THREE.BufferAttribute(clusterPos, 3));
    clusterGeo.setAttribute('color', new THREE.BufferAttribute(clusterColors, 3));
    const cluster = new THREE.Points(
      clusterGeo,
      new THREE.PointsMaterial({ size: 0.4, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true })
    );
    scene.add(cluster);

    // --- Wireframe geometric shapes ---
    const makeWire = (geo: THREE.BufferGeometry, color: number, x: number, y: number, z: number, opacity = 0.18) => {
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity })
      );
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    };

    const shapes = [
      makeWire(new THREE.IcosahedronGeometry(14, 1), 0x7c3aed, 22, 8, -35, 0.12),
      makeWire(new THREE.OctahedronGeometry(9, 1),   0x4338ca, -26, -6, -22, 0.18),
      makeWire(new THREE.DodecahedronGeometry(7, 0), 0x8b5cf6, 6, 18, -28, 0.14),
      makeWire(new THREE.TetrahedronGeometry(6, 0),  0x6d28d9, -12, 14, -18, 0.22),
      makeWire(new THREE.IcosahedronGeometry(5, 0),  0xa78bfa, -20, -16, -30, 0.16),
    ];

    // --- Ambient light for subtle glow on shapes ---
    scene.add(new THREE.AmbientLight(0x4c1d95, 2));
    const pointLight = new THREE.PointLight(0x7c3aed, 3, 60);
    pointLight.position.set(0, 10, 20);
    scene.add(pointLight);

    // --- Mouse parallax ---
    let targetX = 0, targetY = 0;
    const onMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 12;
      targetY = (e.clientY / window.innerHeight - 0.5) * -12;
    };
    document.addEventListener('mousemove', onMouseMove);

    // --- Animation loop ---
    let rafId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      stars.rotation.y = t * 0.015;
      stars.rotation.x = t * 0.005;

      cluster.rotation.y = -t * 0.04;
      cluster.rotation.x = t * 0.015;

      shapes[0].rotation.x = t * 0.18;
      shapes[0].rotation.y = t * 0.13;
      shapes[1].rotation.y = -t * 0.15;
      shapes[1].rotation.z = t * 0.09;
      shapes[2].rotation.x = -t * 0.11;
      shapes[2].rotation.y = t * 0.17;
      shapes[3].rotation.x = t * 0.25;
      shapes[3].rotation.z = -t * 0.13;
      shapes[4].rotation.y = -t * 0.2;
      shapes[4].rotation.x = t * 0.1;

      // Smooth camera follow mouse
      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (targetY - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    // --- Resize ---
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
}
