"""Render existing PhysicsTwin geometry without copying its source into the public site."""
import bpy
from mathutils import Vector

meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
points=[o.matrix_world @ Vector(p) for o in meshes for p in o.bound_box]
lo=Vector(tuple(min(p[i] for p in points) for i in range(3)))
hi=Vector(tuple(max(p[i] for p in points) for i in range(3)))
center=(hi+lo)/2
extent=hi-lo
print('ROTOR BOUNDS',tuple(extent))
for o in list(bpy.context.scene.objects):
    if o.type in {'CAMERA','LIGHT'}: bpy.data.objects.remove(o,do_unlink=True)
metal=bpy.data.materials.new('Homepage brushed titanium');metal.use_nodes=True
bsdf=metal.node_tree.nodes.get('Principled BSDF')
bsdf.inputs['Base Color'].default_value=(.38,.46,.52,1)
bsdf.inputs['Metallic'].default_value=.82
bsdf.inputs['Roughness'].default_value=.3
for o in meshes:
    o.data.materials.clear();o.data.materials.append(metal)
length=max(extent)
axis=max(range(3),key=lambda i:extent[i])
direction=Vector((1,-1,.65));direction[axis]=.45
direction.normalize()
bpy.ops.object.camera_add(location=center+direction*length*2)
camera=bpy.context.object;camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO';camera.data.ortho_scale=length*1.16
bpy.context.scene.camera=camera
def light(name,offset,power,color,size):
    bpy.ops.object.light_add(type='AREA',location=center+Vector(offset)*length)
    o=bpy.context.object;o.name=name;o.data.energy=power*length*length;o.data.color=color;o.data.shape='DISK';o.data.size=size*length
    o.rotation_euler=(center-o.location).to_track_quat('-Z','Y').to_euler()
light('Soft silver key',(1,-1.4,2),160,(.84,.92,1),1.8)
light('Cyan rim',(-1,1,1.2),200,(.25,.8,1),1.1)
light('Warm edge',(1,1,.2),110,(1,.87,.72),1.2)
light('Front fill',(0,-2,.1),65,(.8,.9,1),2)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=32;s.cycles.use_denoising=True
s.world.color=(.15,.15,.15);s.render.film_transparent=True
s.render.resolution_x=1200;s.render.resolution_y=1000;s.render.resolution_percentage=100
s.view_settings.view_transform='AgX';s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA'
s.render.filepath='/tmp/home-rotor.png';bpy.ops.render.render(write_still=True)
