/**
 * Animator metronome&calculator
 *
 * Copyright 2008 Ramon Poca
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var currentBeat = 0;
var isPlaying = 0;
var lastBeat = -1;
var MAXLAPSE = 5000; // Maximum milliseconds between taps


var chronoStatus = 0; // 0 stopped 1 running
var lastChrono = -1; // Chrono counter

var numCells = 4;
function printCells()
{
        var cellB = document.getElementById("cellBox");

        cellB.innerHTML = "";
        for (i=0;i<numCells;i++) {
                cellB.innerHTML += "<SPAN CLASS='ccell' ID='cell"+String(i) +"' BGCOLOR='#380099'>&nbsp;&nbsp;&nbsp;&nbsp;<\/SPAN>";
        }
}
function updateBeat() {
        currentBeat = (currentBeat+1)%numCells;
        var repeat = (1.0/(getBPM()/60000.0))/numCells;
        if (isPlaying) {
                setBeat(currentBeat);
                setTimeout('updateBeat();', repeat);
        } else {
                currentBeat = 0;
                setBeat(0);
        }
}
function setBeat(b)
{
        for (i=0;i<numCells;i++) {
                document.getElementById("cell"+String(i)).style.backgroundColor = (i==b?(i==0?"#00FF00":"#D1008F"):"#380099");
        }       
}
function playBeats()
{
        var repeat = (1.0/(getBPM()/60000.0))/numCells;
        var cb = document.getElementById("play");
        if (isPlaying) {
                cb.value = "Play";
                isPlaying = 0;
                currentBeat = 0;
                setBeat(0);
        } else {
                cb.value = "Stop";
                isPlaying = 1;
            setTimeout('updateBeat();', repeat);
        }
}
function lessBeats()
{
        if (isPlaying) return;
        if (numCells > 2) numCells--;
        printCells();
        setBeat(0);
}

function moreBeats()
{
        if (isPlaying) return;
        if (numCells < 9) numCells++;
        printCells();
        setBeat(0);
}
function updateAll()
{
        updateConversion();
        updateBeats();
}
function changedSelect()
{
        var bt = document.getElementById("fps");
        var val = bt.options[bt.selectedIndex].value;
        bt=document.getElementById("customfps");
        if (val == "custom") {
                bt.disabled = false;
                bt.style.visibility = "visible";
        } else {
                bt.style.visibility = "hidden";
                bt.disabled = true;
        }       
        updateAll();    
}
function getBPM()
{
        var beats = document.getElementById("bpm");
        var bpm = parseFloat(beats.value);
        if (bpm > 0.0) return bpm;
        return -1;
}
function getFPS()
{
        var bt = document.getElementById("fps");
        var val = bt.options[bt.selectedIndex].value;
        if (val == "custom") {
                bt=document.getElementById("customfps");
                if (bt.value == "") return -1;
                if (parseFloat(bt.value) > 0) 
                        return parseFloat(bt.value);
                return -1;
        }
        return val;
}
function updateFramesToSecs()
{
        var fr = document.getElementById("frames");
        var secs = document.getElementById("seconds");
        var frames = parseFloat(fr.value);
        if (frames >= 0.0) {
                var fps = getFPS();
                if (fps > 0) {
                        secs.value = framesToTimeCode();
                        //frames/fps;
                }
        }
}
function updateSecsToFrames()
{
        var fr = document.getElementById("frames");
        var secs = document.getElementById("seconds");
                
        //var seconds = parseFloat(secs.value);
        
        //if (seconds >= 0.0) {
        //      var fps = getFPS();
        //      if (fps > 0) {
        //              fr.value = seconds*fps;
        //      }
        //}
        fr.value = readSecondsOrTimeCode();
}
function updateConversion()
{
        updateFramesToSecs();
}
function updateFPB()
{

        var beats = document.getElementById("bpm");
        var fpb = document.getElementById("framesperbeat");
        var frs = parseFloat(fpb.value);
        if (frs > 0.0) {
                var fps = getFPS();
                if (fps > 0.0) {
                        v = (60.0*fps)/frs;
                        beats.value = Round(v);
                }       
        } else beats.value = "";        
}
function updateBeats()
{
        var beats = document.getElementById("bpm");
        var bpm = parseFloat(beats.value);
        var text = document.getElementById("framesperbeat");
        if (bpm > 0.0) {
                var fps = getFPS();
                if (fps > 0.0) {
                        v = fps/(bpm/60.0);
                        text.value = Round(v);
                }       
                matchPresetBPM(bpm);
        } else text.value = "";
}
function calculateBPM()
{
        var d = new Date();
        
        if (lastBeat < 0) {
                lastBeat = d.getTime();
        } else {
                t = d.getTime();
                if ((t - lastBeat) >= MAXLAPSE) { // Reset
                        lastBeat = t;
                        return true;
                }
                BPM = 60.0/((t-lastBeat)/1000.0);
                b = document.getElementById('bpm');
                b.value = Round(BPM);
                lastBeat = t;
                updateAll();
        }
}
function Round(f)
{
        return Math.round(f*100.0)/100.0;
}

function msToString(t)
{
        var m = Math.floor(t/60000.0);
        var s = Math.floor((t-(m*60000.0))/1000.0);
        var ms = Math.round((t-(m*60000.0) - s*1000.0)/10);
        var frs = Round((t/1000.0)*getFPS());
        return (m>9?"":"0")+String(m) + ":"+(s>9?"":"0")+String(s)+"."+(ms>9?"":"0")+String(ms)+" (" + (frs>999?"":"0")+(frs>99?"":"0")+String(Math.round(frs))+" frames)";
}
function updateChrono() // Update chrono value on every frame tick
{
        if (chronoStatus == 0) return;
        var d = new Date();
        var b = document.getElementById('chronotext');
        var tl = d.getTime() - lastChrono;
        b.innerHTML = "&nbsp;"+ msToString(tl) +"&nbsp;";
        var fps = getFPS();
        setTimeout("updateChrono();",(1.0/fps)*1000);
}
function clickChrono()
{
        var d = new Date();
        var b = document.getElementById('chronotext');
        var but = document.getElementById('chrono');
        var rbut = document.getElementById('stopchrono');
        var b2 = document.getElementById('chronolap');
        if (chronoStatus == 0) {
                var fps = getFPS();
                lastChrono = d.getTime();
                chronoStatus = 1;
                but.value = "Lap   ";
                rbut.value = "Stop";
                b2.innerHTML = "";
                setTimeout("updateChrono();",(1.0/fps)*1000);
        } else {
                // Keep time
                b2.innerHTML = b2.innerHTML + "<br/>" + b.innerHTML;
               _IG_AdjustIFrameHeight();
        }


}
function stopChrono()
{
        var b = document.getElementById('chronotext');
        var but = document.getElementById('chrono');
        var rbut = document.getElementById('stopchrono');
        if (chronoStatus == 1) {
                chronoStatus = 0;
                but.value = "Start";
                rbut.value = "Reset";
        } else {
                // Reset chrono
                var b2 = document.getElementById('chronolap');
                b2.innerHTML = "";
                but.value = "Start";
                rbut.value = "Reset";
                b.innerHTML = "&nbsp;00:00.00 (0 frames)";      
                
        }
        _IG_AdjustIFrameHeight();
}
  function matchPresetBPM(bpm)
  {
          var pbpmlist = document.getElementById("presetBPM");
          pbpmlist.selectedIndex = 0;     
          for (i=0;i<pbpmlist.options.length;i++) {
                  var pbpm = pbpmlist.options[i].value;
                  if (parseFloat(pbpm) == bpm) {
                          pbpmlist.selectedIndex = i;     
                  }
          }                       
  }
  function setPresetBPM()
  {
          var pbpmlist = document.getElementById("presetBPM");
          var pbpm = pbpmlist.options[pbpmlist.selectedIndex].value;
          if (parseFloat(pbpm) > 0) {
                  var b = document.getElementById('bpm');
                  b.value = pbpm;
                  updateAll();
          
          }
  }
          
  function framesToTimeCode()
  {
          var fr = document.getElementById("frames");
          var f = parseFloat(fr.value);
          var fps = getFPS();
          
          var sec = Math.floor(f/fps);
        var rf = Math.floor(f%fps);
        var min = Math.floor(sec/60.0);
        var res = "";
        sec = sec%60;
        res = min+":"+sec+"."+rf;
        return res;     
}

function readSecondsOrTimeCode()
{
        var f = -1;
        var fps = getFPS();
        var fr = document.getElementById("seconds");
        var     ts = fr.value;

        if (ts.indexOf(":") > 0) {
                // Parse timecode
                ts = fr.value;
                mins = parseFloat(ts.slice(0,ts.indexOf(":")));
                ts = ts.slice(ts.indexOf(":")+1);
                if (ts != "" && ts != ".") 
                {
                        if (ts.indexOf(".") > 0) {
                                secs = parseFloat(ts.slice(0,ts.indexOf(".")));
                                restframes = parseFloat(ts.slice(ts.indexOf(".")+1));
                        } else {
                                secs = parseFloat(ts);
                                restframes = 0;
                        }
                }
                f = mins*60*fps + secs*fps + restframes;
        } else  f = fps*parseFloat(ts);
        
        return f;
}
