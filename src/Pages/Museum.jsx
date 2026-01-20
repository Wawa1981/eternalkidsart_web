import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { 
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  X,
  Info,
  Maximize2,
  RotateCcw,
  Sparkles,
  Navigation,
  Move,
  Map,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import DrawingDetailModal from '@/Components/ui/dashboard/DrawingDetailModal';

export default function Museum() {
  const [user, setUser] = useState(null);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [hoveredDrawing, setHoveredDrawing] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [currentRoom, setCurrentRoom] = useState(0);
  const [isLoading3D, setIsLoading3D] = useState(true);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    mouseX: 0,
    mouseY: 0
  });
  const frameObjectsRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const roomsRef = useRef([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: drawings = [] } = useQuery({
    queryKey: ['museumDrawings'],
    queryFn: () => base44.entities.Drawing.filter({ created_by: user?.email }, '-created_date'),
    enabled: !!user
  });

  useEffect(() => {
    if (!containerRef.current || drawings.length === 0) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f1e);
    scene.fog = new THREE.Fog(0x0f0f1e, 1, 80);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 8);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting - More sophisticated
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Main ceiling lights
    const mainLight1 = new THREE.PointLight(0xfff5e1, 0.6, 30);
    mainLight1.position.set(0, 3.8, 0);
    scene.add(mainLight1);

    const mainLight2 = new THREE.PointLight(0xfff5e1, 0.5, 25);
    mainLight2.position.set(-15, 3.8, -15);
    scene.add(mainLight2);

    const mainLight3 = new THREE.PointLight(0xfff5e1, 0.5, 25);
    mainLight3.position.set(15, 3.8, -15);
    scene.add(mainLight3);

    // Helper function to create a room
    const createRoom = (offsetX, offsetZ, roomIndex) => {
      const roomSize = 25;
      const roomGroup = new THREE.Group();
      roomGroup.position.set(offsetX, 0, offsetZ);
      
      // Floor - Elegant parquet
      const floorGeometry = new THREE.PlaneGeometry(roomSize, roomSize);
      const floorTexture = new THREE.TextureLoader().load('data:image/svg+xml;base64,' + btoa(`
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" fill="#3d3d4d"/>
          <rect x="0" y="0" width="50" height="10" fill="#424252"/>
          <rect x="50" y="10" width="50" height="10" fill="#424252"/>
          <rect x="0" y="20" width="50" height="10" fill="#424252"/>
        </svg>
      `));
      floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
      floorTexture.repeat.set(10, 10);
      
      const floorMaterial = new THREE.MeshStandardMaterial({ 
        map: floorTexture,
        roughness: 0.7,
        metalness: 0.1
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      roomGroup.add(floor);

      // Ceiling with molding
      const ceilingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf8f8f5,
        roughness: 0.8
      });
      const ceiling = new THREE.Mesh(floorGeometry, ceilingMaterial);
      ceiling.position.y = 4.5;
      ceiling.rotation.x = Math.PI / 2;
      ceiling.receiveShadow = true;
      roomGroup.add(ceiling);

      // Walls - Museum white
      const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xfafaf7,
        roughness: 0.9,
        metalness: 0.05
      });

      const halfRoom = roomSize / 2;

      // Back wall
      const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(roomSize, 4.5),
        wallMaterial
      );
      backWall.position.set(0, 2.25, -halfRoom);
      backWall.receiveShadow = true;
      roomGroup.add(backWall);

      // Front wall with door
      const doorWidth = 3;
      const leftFrontWall = new THREE.Mesh(
        new THREE.PlaneGeometry((roomSize - doorWidth) / 2, 4.5),
        wallMaterial
      );
      leftFrontWall.position.set(-(roomSize / 4 + doorWidth / 4), 2.25, halfRoom);
      leftFrontWall.rotation.y = Math.PI;
      leftFrontWall.receiveShadow = true;
      roomGroup.add(leftFrontWall);

      const rightFrontWall = new THREE.Mesh(
        new THREE.PlaneGeometry((roomSize - doorWidth) / 2, 4.5),
        wallMaterial
      );
      rightFrontWall.position.set((roomSize / 4 + doorWidth / 4), 2.25, halfRoom);
      rightFrontWall.rotation.y = Math.PI;
      rightFrontWall.receiveShadow = true;
      roomGroup.add(rightFrontWall);

      // Door frame
      const doorFrameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b7355,
        roughness: 0.5,
        metalness: 0.3
      });
      const doorFrame = new THREE.Mesh(
        new THREE.BoxGeometry(doorWidth + 0.2, 3, 0.15),
        doorFrameMaterial
      );
      doorFrame.position.set(0, 1.5, halfRoom);
      roomGroup.add(doorFrame);

      // Left wall
      const leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(roomSize, 4.5),
        wallMaterial
      );
      leftWall.position.set(-halfRoom, 2.25, 0);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.receiveShadow = true;
      roomGroup.add(leftWall);

      // Right wall
      const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(roomSize, 4.5),
        wallMaterial
      );
      rightWall.position.set(halfRoom, 2.25, 0);
      rightWall.rotation.y = -Math.PI / 2;
      rightWall.receiveShadow = true;
      roomGroup.add(rightWall);

      // Baseboards
      const baseboardMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe8e8e0,
        roughness: 0.8
      });
      const baseboard1 = new THREE.Mesh(
        new THREE.BoxGeometry(roomSize, 0.15, 0.1),
        baseboardMaterial
      );
      baseboard1.position.set(0, 0.075, -halfRoom + 0.05);
      roomGroup.add(baseboard1);

      // Crown molding
      const moldingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf5f5f0,
        roughness: 0.7
      });
      const molding1 = new THREE.Mesh(
        new THREE.BoxGeometry(roomSize, 0.1, 0.15),
        moldingMaterial
      );
      molding1.position.set(0, 4.45, -halfRoom + 0.075);
      roomGroup.add(molding1);

      // Benches in center
      if (roomIndex % 2 === 0) {
        const benchMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x8b7355,
          roughness: 0.6
        });
        const bench = new THREE.Mesh(
          new THREE.BoxGeometry(4, 0.6, 1.2),
          benchMaterial
        );
        bench.position.set(0, 0.3, 0);
        bench.castShadow = true;
        roomGroup.add(bench);
      }

      scene.add(roomGroup);
      roomsRef.current.push({ group: roomGroup, offsetX, offsetZ });
      
      return roomGroup;
    };

    // Create multiple rooms
    const drawingsPerRoom = 18;
    const numRooms = Math.ceil(drawings.length / drawingsPerRoom);
    const roomSpacing = 28;
    
    for (let i = 0; i < numRooms; i++) {
      const offsetZ = i * roomSpacing;
      createRoom(0, -offsetZ, i);
    }

    // Add frames with drawings - Different sizes for variety
    const frameObjects = [];
    const textureLoader = new THREE.TextureLoader();
    
    // Frame sizes: small, medium, large, extra large
    const frameSizes = [
      { width: 1.8, height: 1.3, frameColor: 0x8b7355 },  // Small - Classic gold
      { width: 2.4, height: 1.8, frameColor: 0x2c2416 },  // Medium - Dark wood
      { width: 3.2, height: 2.4, frameColor: 0xd4af37 },  // Large - Golden
      { width: 2.0, height: 2.6, frameColor: 0x5c4033 },  // Portrait - Mahogany
      { width: 4.0, height: 2.2, frameColor: 0x1a1410 }   // Extra wide - Black
    ];

    const createFrame = (drawing, position, sizeIndex, roomOffset) => {
      const size = frameSizes[sizeIndex % frameSizes.length];
      const frameDepth = 0.12;
      
      // Ornate frame
      const frameGeometry = new THREE.BoxGeometry(
        size.width + 0.2, 
        size.height + 0.2, 
        frameDepth
      );
      const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: size.frameColor,
        roughness: 0.4,
        metalness: 0.4
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.set(
        position.x, 
        position.y, 
        position.z + roomOffset
      );
      frame.rotation.y = position.rotY;
      frame.castShadow = true;
      scene.add(frame);

      // Inner mat/border
      const matGeometry = new THREE.BoxGeometry(
        size.width + 0.1, 
        size.height + 0.1, 
        frameDepth - 0.02
      );
      const matMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf5f5f0,
        roughness: 0.9
      });
      const mat = new THREE.Mesh(matGeometry, matMaterial);
      mat.position.copy(frame.position);
      mat.position.z += position.rotY === 0 ? 0.01 : 0;
      mat.position.x += position.rotY === Math.PI / 2 ? 0.01 : position.rotY === -Math.PI / 2 ? -0.01 : 0;
      mat.rotation.y = position.rotY;
      scene.add(mat);

      // Load and add image
      textureLoader.load(
        drawing.enhanced_image_url || drawing.image_url,
        (texture) => {
          const imageGeometry = new THREE.PlaneGeometry(size.width, size.height);
          const imageMaterial = new THREE.MeshStandardMaterial({ 
            map: texture,
            side: THREE.DoubleSide,
            emissive: 0x111111,
            emissiveIntensity: 0.1
          });
          const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
          imageMesh.position.copy(frame.position);
          imageMesh.rotation.y = position.rotY;
          
          // Offset slightly forward
          const offset = frameDepth / 2 + 0.02;
          if (position.rotY === 0) imageMesh.position.z += offset;
          else if (position.rotY === Math.PI / 2) imageMesh.position.x += offset;
          else if (position.rotY === -Math.PI / 2) imageMesh.position.x -= offset;
          
          imageMesh.userData = { drawing, roomIndex: Math.floor(roomOffset / -28) };
          scene.add(imageMesh);
          frameObjects.push(imageMesh);

          // Dedicated spotlight for each artwork
          const spotlight = new THREE.SpotLight(0xfff5e1, 1.2);
          spotlight.position.set(
            position.x, 
            position.y + 2, 
            position.z + roomOffset
          );
          spotlight.target = imageMesh;
          spotlight.angle = Math.PI / 8;
          spotlight.penumbra = 0.5;
          spotlight.decay = 2;
          spotlight.distance = 10;
          spotlight.castShadow = true;
          spotlight.shadow.mapSize.width = 1024;
          spotlight.shadow.mapSize.height = 1024;
          scene.add(spotlight);

          // Subtle accent light from below
          const accentLight = new THREE.PointLight(0xffeedd, 0.3, 3);
          accentLight.position.set(
            position.x,
            position.y - 0.5,
            position.z + roomOffset + (position.rotY === 0 ? 0.5 : 0)
          );
          scene.add(accentLight);
        },
        undefined,
        (error) => console.error('Error loading texture:', error)
      );
    };

    // Position templates for each room wall
    const roomPositions = [
      // Back wall - 6 pieces
      { x: -9, y: 2.2, z: -12, rotY: 0, size: 1 },
      { x: -5, y: 1.8, z: -12, rotY: 0, size: 0 },
      { x: -1, y: 2.5, z: -12, rotY: 0, size: 2 },
      { x: 3, y: 1.8, z: -12, rotY: 0, size: 3 },
      { x: 6, y: 2.2, z: -12, rotY: 0, size: 1 },
      { x: 9.5, y: 2.0, z: -12, rotY: 0, size: 0 },
      // Left wall - 6 pieces
      { x: -12, y: 2.3, z: -9, rotY: Math.PI / 2, size: 2 },
      { x: -12, y: 1.9, z: -5, rotY: Math.PI / 2, size: 0 },
      { x: -12, y: 2.1, z: -1, rotY: Math.PI / 2, size: 1 },
      { x: -12, y: 2.5, z: 3, rotY: Math.PI / 2, size: 3 },
      { x: -12, y: 1.8, z: 7, rotY: Math.PI / 2, size: 0 },
      { x: -12, y: 2.2, z: 10, rotY: Math.PI / 2, size: 1 },
      // Right wall - 6 pieces
      { x: 12, y: 2.0, z: -9, rotY: -Math.PI / 2, size: 1 },
      { x: 12, y: 2.4, z: -5, rotY: -Math.PI / 2, size: 2 },
      { x: 12, y: 1.8, z: -1, rotY: -Math.PI / 2, size: 0 },
      { x: 12, y: 2.2, z: 3, rotY: -Math.PI / 2, size: 1 },
      { x: 12, y: 2.6, z: 7, rotY: -Math.PI / 2, size: 3 },
      { x: 12, y: 1.9, z: 10, rotY: -Math.PI / 2, size: 0 },
    ];

    // Distribute drawings across rooms
    drawings.forEach((drawing, index) => {
      const roomIndex = Math.floor(index / drawingsPerRoom);
      const positionIndex = index % drawingsPerRoom;
      
      if (positionIndex >= roomPositions.length) return;
      
      const position = roomPositions[positionIndex];
      const roomOffset = -roomIndex * roomSpacing;
      
      createFrame(drawing, position, positionIndex, roomOffset);
    });

    frameObjectsRef.current = frameObjects;

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Keyboard controls
    const handleKeyDown = (e) => {
      const controls = controlsRef.current;
      switch(e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          controls.forward = true;
          break;
        case 's':
        case 'arrowdown':
          controls.backward = true;
          break;
        case 'a':
        case 'arrowleft':
          controls.left = true;
          break;
        case 'd':
        case 'arrowright':
          controls.right = true;
          break;
      }
    };

    const handleKeyUp = (e) => {
      const controls = controlsRef.current;
      switch(e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          controls.forward = false;
          break;
        case 's':
        case 'arrowdown':
          controls.backward = false;
          break;
        case 'a':
        case 'arrowleft':
          controls.left = false;
          break;
        case 'd':
        case 'arrowright':
          controls.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse movement for camera rotation
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      controlsRef.current.mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      controlsRef.current.mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Update mouse for raycasting
      mouseRef.current.x = controlsRef.current.mouseX;
      mouseRef.current.y = controlsRef.current.mouseY;
    };

    const handleClick = () => {
      if (hoveredDrawing) {
        setSelectedDrawing(hoveredDrawing);
      }
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('click', handleClick);

    // Animation loop
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const clock = new THREE.Clock();
    
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const controls = controlsRef.current;

      // Camera rotation based on mouse
      camera.rotation.y = -controls.mouseX * 0.5;
      camera.rotation.x = -controls.mouseY * 0.3;

      // Movement
      const speed = 5;
      direction.set(0, 0, 0);

      if (controls.forward) direction.z -= 1;
      if (controls.backward) direction.z += 1;
      if (controls.left) direction.x -= 1;
      if (controls.right) direction.x += 1;

      direction.normalize();

      if (direction.length() > 0) {
        velocity.z = direction.z * speed * delta;
        velocity.x = direction.x * speed * delta;
        
        // Apply rotation to movement direction
        const rotatedVelocity = velocity.clone();
        rotatedVelocity.applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y);
        
        camera.position.add(rotatedVelocity);

        // Dynamic boundaries based on number of rooms
        camera.position.x = Math.max(-11, Math.min(11, camera.position.x));
        const maxZ = 11;
        const minZ = -(numRooms * roomSpacing - 17);
        camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z));
        
        // Update current room
        const newRoom = Math.floor(-camera.position.z / roomSpacing);
        if (newRoom !== currentRoom && newRoom >= 0 && newRoom < numRooms) {
          setCurrentRoom(newRoom);
        }
      }

      // Raycasting for hover effect
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(frameObjectsRef.current);
      
      if (intersects.length > 0) {
        const drawing = intersects[0].object.userData.drawing;
        setHoveredDrawing(drawing);
        document.body.style.cursor = 'pointer';
      } else {
        setHoveredDrawing(null);
        document.body.style.cursor = 'default';
      }

      renderer.render(scene, camera);
    };

    animate();
    setIsLoading3D(false);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handleClick);
        if (renderer.domElement) {
          containerRef.current.removeChild(renderer.domElement);
        }
      }
      renderer.dispose();
    };
  }, [drawings]);

  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 1.6, 8);
      cameraRef.current.rotation.set(0, 0, 0);
      setCurrentRoom(0);
    }
  };

  const goToRoom = (roomIndex) => {
    if (cameraRef.current && roomIndex >= 0) {
      cameraRef.current.position.set(0, 1.6, -roomIndex * 28 + 8);
      setCurrentRoom(roomIndex);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  if (drawings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/10 backdrop-blur-lg rounded-3xl p-12 max-w-md"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20 flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Musée Virtuel 3D</h2>
          <p className="text-white/70 mb-6">
            Ajoutez des dessins pour créer votre galerie d'art immersive en 3D
          </p>
          <Button 
            onClick={() => window.location.href = '/Dashboard'}
            className="bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl"
          >
            Ajouter des dessins
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading3D && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900 flex items-center justify-center z-50"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4" />
              <p className="text-white text-lg">Chargement du musée 3D...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 p-4 sm:p-6 pointer-events-auto"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/10">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Musée <span className="font-handwritten text-2xl sm:text-3xl bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">Virtuel 3D</span>
              </h1>
              <p className="text-white/60 text-sm mt-1">{drawings.length} œuvres exposées</p>
            </div>

            <div className="flex gap-2">
              {!showMinimap && roomsRef.current.length > 1 && (
                <Button
                  onClick={() => setShowMinimap(true)}
                  variant="outline"
                  size="icon"
                  className="bg-black/40 backdrop-blur-lg border-white/10 text-white hover:bg-white/10 rounded-xl"
                >
                  <Map className="w-5 h-5" />
                </Button>
              )}
              <Button
                onClick={() => setShowControls(!showControls)}
                variant="outline"
                size="icon"
                className="bg-black/40 backdrop-blur-lg border-white/10 text-white hover:bg-white/10 rounded-xl"
              >
                <Info className="w-5 h-5" />
              </Button>
              <Button
                onClick={resetCamera}
                variant="outline"
                size="icon"
                className="bg-black/40 backdrop-blur-lg border-white/10 text-white hover:bg-white/10 rounded-xl"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Controls Info */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute left-4 sm:left-6 top-28 pointer-events-auto"
            >
              <Card className="bg-black/40 backdrop-blur-lg border-white/10 text-white w-64">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Navigation className="w-5 h-5 text-rose-400" />
                    <h3 className="font-semibold">Contrôles</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Souris</span>
                      <Badge variant="outline" className="border-white/20 text-white">
                        Regarder
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <kbd className="px-2 py-1 bg-white/10 rounded text-xs">W</kbd>
                        <kbd className="px-2 py-1 bg-white/10 rounded text-xs">A</kbd>
                        <kbd className="px-2 py-1 bg-white/10 rounded text-xs">S</kbd>
                        <kbd className="px-2 py-1 bg-white/10 rounded text-xs">D</kbd>
                      </div>
                      <Badge variant="outline" className="border-white/20 text-white">
                        Déplacer
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Clic</span>
                      <Badge variant="outline" className="border-white/20 text-white">
                        Détails
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Lightbulb className="w-4 h-4" />
                      <span>Éclairage dynamique par œuvre</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimap */}
        <AnimatePresence>
          {showMinimap && roomsRef.current.length > 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-4 sm:right-6 top-28 pointer-events-auto"
            >
              <Card className="bg-black/40 backdrop-blur-lg border-white/10 text-white w-48">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Map className="w-5 h-5 text-amber-400" />
                    <h3 className="font-semibold text-sm">Navigation</h3>
                  </div>
                  <div className="space-y-2">
                    {roomsRef.current.map((room, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToRoom(idx)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          currentRoom === idx 
                            ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-medium' 
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Salle {idx + 1}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              currentRoom === idx 
                                ? 'border-white/30 text-white' 
                                : 'border-white/20 text-white/60'
                            }`}
                          >
                            {Math.min(18, drawings.length - idx * 18)} œuvres
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <button
                      onClick={() => setShowMinimap(false)}
                      className="text-xs text-white/50 hover:text-white/80 transition-colors"
                    >
                      Masquer la carte
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hovered Drawing Info */}
        <AnimatePresence>
          {hoveredDrawing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto"
            >
              <Card className="bg-black/60 backdrop-blur-xl border-white/10 text-white">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img 
                      src={hoveredDrawing.enhanced_image_url || hoveredDrawing.image_url}
                      alt={hoveredDrawing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{hoveredDrawing.title}</h3>
                    <p className="text-white/70 text-sm">
                      {hoveredDrawing.child_name}
                      {hoveredDrawing.child_age ? `, ${hoveredDrawing.child_age} ans` : ''}
                    </p>
                  </div>
                  <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">
                    <Maximize2 className="w-3 h-3 mr-1" />
                    Cliquez pour agrandir
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Touch Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 pointer-events-auto md:hidden">
          <div className="grid grid-cols-3 gap-2">
            <div />
            <Button
              onTouchStart={() => controlsRef.current.forward = true}
              onTouchEnd={() => controlsRef.current.forward = false}
              size="icon"
              className="bg-black/40 backdrop-blur-lg border border-white/10 text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
            <div />
            <Button
              onTouchStart={() => controlsRef.current.left = true}
              onTouchEnd={() => controlsRef.current.left = false}
              size="icon"
              className="bg-black/40 backdrop-blur-lg border border-white/10 text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button
              onTouchStart={() => controlsRef.current.backward = true}
              onTouchEnd={() => controlsRef.current.backward = false}
              size="icon"
              className="bg-black/40 backdrop-blur-lg border border-white/10 text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowDown className="w-5 h-5" />
            </Button>
            <Button
              onTouchStart={() => controlsRef.current.right = true}
              onTouchEnd={() => controlsRef.current.right = false}
              size="icon"
              className="bg-black/40 backdrop-blur-lg border border-white/10 text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Drawing Detail Modal */}
      <DrawingDetailModal
        drawing={selectedDrawing}
        onClose={() => setSelectedDrawing(null)}
      />
    </div>
  );
}
