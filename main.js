

//import three.js though CDN-------------------------------
  import * as THREE from 'https://unpkg.com/three@0.140.2/build/three.module.js';

//import Orbit Control though CDN--------------------------
  import { OrbitControls } from 'https://unpkg.com/three@0.140.2/examples/jsm/controls/OrbitControls.js';

//import FlakeTexture, RGBELoader--------------------------
  import { FlakesTexture } from './FlakesTexture.js';
  import { RGBELoader } from './RGBELoader.js';

//import gsap library--------------------------------------
  import gsap from 'gsap'; 


//import dat.gui-------------------------------------------
  import * as dat from 'dat.gui';

  const gui = new dat.GUI({width: 350});
  const world_box = {
      box: {
      width: 200,
      height: 200,
      depth: 200,
      widthSegments: 50,
      heightSegments: 50,
      depthSegments: 50,
      r: 0.01,
      g: 0.19,
      b: 0.4,
      hv_r: 0.1,
      hv_g: 0.5,
      hv_b: 0.99
    }
  }

  //add gui panels + update function when parameters are updated
  gui.add(world_box.box, 'width', 1, 500).onChange(generateBox).name("Width");
  gui.add(world_box.box, 'height', 1, 500).onChange(generateBox).name("Height");
  gui.add(world_box.box, 'depth', 1, 500).onChange(generateBox).name("Depth");
  gui.add(world_box.box, 'widthSegments', 1, 100).onChange(generateBox).name("Width Segments");
  gui.add(world_box.box, 'heightSegments', 1, 100).onChange(generateBox).name("Height Segments");
  gui.add(world_box.box, 'depthSegments', 1, 100).onChange(generateBox).name("Depth Segments");
  gui.add(world_box.box, 'r', 0, 1.0).onChange(generateBox).name("Box Color: Red");
  gui.add(world_box.box, 'g', 0, 1.0).onChange(generateBox).name("Box Color: Green");
  gui.add(world_box.box, 'b', 0, 1.0).onChange(generateBox).name("Box Color: Blue");
  gui.add(world_box.box, 'hv_r', 0, 1.0).onChange(generateBox).name("Hover Color: Red");
  gui.add(world_box.box, 'hv_g', 0, 1.0).onChange(generateBox).name("Hover Color: Green");
  gui.add(world_box.box, 'hv_b', 0, 1.0).onChange(generateBox).name("Hover Color: Blue");
  

  function generateBox(){
    boxMesh.geometry.dispose();
    boxMesh.geometry = new THREE.BoxGeometry(
      world_box.box.width,
      world_box.box.height,
      world_box.box.depth, 
      world_box.box.widthSegments, 
      world_box.box.heightSegments,
      world_box.box.depthSegments
    );

    //vertice position randomization
    const { array } = boxMesh.geometry.attributes.position;
    const randomValues = [];
    for (let i = 0; i < array.length; i++){

      if (i % 3 === 0){
        const x = array[i];
        const y = array[i+1];
        const z = array[i+2];

        array[i] = x + (Math.random() - 0.5) * 3;   //Math.random(), 0 < 1 (converted into -0.5 < 0.5)
        array[i+1] = y + (Math.random() - 0.5) * 3;
        array[i+2] = z + (Math.random() - 0.5) * 3;
      }
      
      randomValues.push(Math.random() * Math.PI * 2);  //Math.PI, 3.14159  
    }


    //add new attributes into <planeMesh.geometry.attributes.position>
    boxMesh.geometry.attributes.position.randomValues = randomValues;
    boxMesh.geometry.attributes.position.originalPosition = boxMesh.geometry.attributes.position.array;


    //color attribute addition, default color setting
    const colors = [];
    for (let i = 0; i < boxMesh.geometry.attributes.position.count; i++){
      colors.push(world_box.box.r, world_box.box.g, world_box.box.b);
    }

    boxMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
  }



//initial settings--------------------------------------------
  const raycaster = new THREE.Raycaster();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});

  renderer.setSize(innerWidth, innerHeight); 
  renderer.setPixelRatio(devicePixelRatio);  
  document.body.appendChild(renderer.domElement);  //insert the canvas

  // renderer.outputEncoding = THREE.sRGBEncoding;
  // renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // renderer.toneMappingExposure = 1.25;

  new OrbitControls(camera, renderer.domElement);
  camera.position.z = 300;  

//default box geometry (MeshStandardMaterial)-------------------

  const boxGeometry = new THREE.BoxGeometry(
      world_box.box.width,
      world_box.box.height,
      world_box.box.depth, 
      world_box.box.widthSegments, 
      world_box.box.heightSegments,
      world_box.box.depthSegments
    );
  const boxMaterial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    flatShading: THREE.FlatShading,
    vertexColors: true
    });
  // const boxMaterial = new THREE.MeshPhysicalMaterial(boxPhysicalMaterial);
  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  boxMaterial.wireframe = true;
  gui.add(boxMaterial, 'wireframe').name("wireframe")
  scene.add(boxMesh);
  generateBox();  

//add light and backlight--------------------------------------  
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, -1, 1);
  scene.add(light);

  const backLight = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 0, 1);
  scene.add(backLight);

//declear a mouse-----------------------------------------------
  const mouse = {
    x: undefined,
    y: undefined
  }

//define an animate function------------------------------------
  let frame = 0;
  function animate(){
    requestAnimationFrame(animate);           //making a loop for animation
    renderer.render(scene, camera); 
    raycaster.setFromCamera(mouse, camera);
    frame += 0.01;

    //animate x & y positions, randomValues[] enables each (x,y) move respectively
    const { array, originalPosition, randomValues } = boxMesh.geometry.attributes.position;

    for (let i = 0; i < array.length; i += 3){
      //x value
      array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.02;  
      //y value
      array[i+1] = originalPosition[i+1] + Math.sin(frame + randomValues[i+1]) * 0.002;  
      //z value
      array[i+2] = originalPosition[i+2] + Math.sin(frame + randomValues[i+2]) * 0.03; 
    } 

     boxMesh.geometry.attributes.position.needsUpdate = true; 


    //raycasting for mouse picking
    const intersects = raycaster.intersectObject(boxMesh);
      if (intersects.length > 0) {

        /** 
        intersects[0].face.a -> where raycasting intersects
        color.setX, color.setY, color.setZ -> set hover colors
        */

      const {color} = intersects[0].object.geometry.attributes;

      //vertice 1 (index -> a)
      color.setX(intersects[0].face.a, 0.1);    //red       
      color.setY(intersects[0].face.a, 0.5);    //green
      color.setZ(intersects[0].face.a, 1);      //blue

      //vertice 2 (index -> b)
      color.setX(intersects[0].face.b, 0.1);
      color.setY(intersects[0].face.b, 0.5);
      color.setZ(intersects[0].face.b, 1);

      //vertice 3 (index -> c)   
      color.setX(intersects[0].face.c, 0.1);
      color.setY(intersects[0].face.c, 0.5); 
      color.setZ(intersects[0].face.c, 1);  

      color.needsUpdate = true;  //update color attributes 

      const initialColor = {
        r: world_box.box.r, 
        g: world_box.box.g,
        b: world_box.box.b
      };

      const hoverColor = {
        r: world_box.box.hv_r, 
        g: world_box.box.hv_g,
        b: world_box.box.hv_b
      };

      gsap.to(hoverColor, {
        r: initialColor.r,
        g: initialColor.g,
        b: initialColor.b,
        duration: 1.5,
        onUpdate: () => {

          //vertice 1 (index -> a)
          color.setX(intersects[0].face.a, hoverColor.r);           
          color.setY(intersects[0].face.a, hoverColor.g); 
          color.setZ(intersects[0].face.a, hoverColor.b);      

          //vertice 2 (index -> b)
          color.setX(intersects[0].face.b, hoverColor.r);
          color.setY(intersects[0].face.b, hoverColor.g);
          color.setZ(intersects[0].face.b, hoverColor.b);

          //vertice 3 (index -> c)   
          color.setX(intersects[0].face.c, hoverColor.r);
          color.setY(intersects[0].face.c, hoverColor.g); 
          color.setZ(intersects[0].face.c, hoverColor.b);  

          color.needsUpdate = true;
        } 
      });

      }

      boxMesh.rotation.x += 0.001;
      boxMesh.rotation.y += 0.0015;
  }  

  animate();

  //add mouse tracking, normalize coordinates
  addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / innerHeight) * 2 + 1;
  });





